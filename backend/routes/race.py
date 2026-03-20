from fastapi import APIRouter, Query
import fastf1
import pandas as pd
import threading
import requests as req

_cache = {}
_cache_lock = threading.Lock()
_fetch_locks = {}
_fetch_locks_lock = threading.Lock()

def get_cached(key, fn):
    # Check cache first
    with _cache_lock:
        if key in _cache:
            print(f"Cache hit: {key}")
            return _cache[key]

    # Get or create a per-key lock
    with _fetch_locks_lock:
        if key not in _fetch_locks:
            _fetch_locks[key] = threading.Lock()
        key_lock = _fetch_locks[key]

    # Only one thread fetches at a time per key
    with key_lock:
        # Check cache again after acquiring lock
        with _cache_lock:
            if key in _cache:
                print(f"Cache hit (after lock): {key}")
                return _cache[key]

        print(f"Cache miss: {key} — fetching...")
        result = fn()
        with _cache_lock:
            _cache[key] = result
        return result

fastf1.Cache.enable_cache('cache')
router = APIRouter()

@router.get("/race")
def get_race(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):
    cache_key = f"race_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'R')
        session.load()
        laps = session.laps
        drivers = laps['Driver'].unique().tolist()
        position_data = {}
        lap_time_data = {}
        tire_data = {}
        for driver in drivers:
            dl = laps.pick_drivers(driver)
            position_data[driver] = dl['Position'].fillna(0).astype(int).tolist()
            lap_time_data[driver] = [x if pd.notna(x) else None for x in dl['LapTime'].dt.total_seconds().round(3).tolist()]
            tire_data[driver] = dl['Compound'].tolist()
        results = session.results
        driver_info = {}
        for _, row in results.iterrows():
            driver_info[row['Abbreviation']] = {
                'fullName': row['FullName'],
                'teamName': row['TeamName'],
                'teamColor': '#' + str(row['TeamColor']) if pd.notna(row['TeamColor']) else '#888888',
                'position': int(row['Position']) if pd.notna(row['Position']) else 0,
            }
        return {
            "drivers": drivers,
            "position_data": position_data,
            "lap_time_data": lap_time_data,
            "tire_data": tire_data,
            "driver_info": driver_info,
            "total_laps": int(laps['LapNumber'].max()),
            "gp": gp,
            "year": year
        }

    return get_cached(cache_key, fetch)

@router.get("/races")
def get_races(year: int = Query(..., ge=2018, le=2030)):
    from datetime import datetime, timezone
    import pandas as pd
    schedule = fastf1.get_event_schedule(year)
    now = pd.Timestamp.now(tz='UTC')
    filtered = schedule[schedule['EventFormat'] != 'testing'].copy()
    # Make EventDate timezone aware if it isn't
    if filtered['EventDate'].dt.tz is None:
        filtered['EventDate'] = filtered['EventDate'].dt.tz_localize('UTC')
    past_races = filtered[
        filtered['EventDate'] < now
    ]['EventName'].tolist()
    return {"races": past_races}

@router.get("/gap-to-leader")
def get_gap_to_leader(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):

    cache_key = f"gap_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'R')
        session.load()
        laps = session.laps
        drivers = laps['Driver'].unique().tolist()
        total_laps = int(laps['LapNumber'].max())

        leader_times = {}
        for lap_num in range(1, total_laps + 1):
            lap_data = laps[laps['LapNumber'] == lap_num]
            if lap_data.empty:
                continue
            valid = lap_data.dropna(subset=['LapTime'])
            if valid.empty:
                continue
            fastest = valid.loc[valid['LapTime'].idxmin()]
            leader_times[lap_num] = fastest['LapTime'].total_seconds()

        gap_data = {}
        for driver in drivers:
            dl = laps.pick_drivers(driver)
            gaps = []
            for lap_num in range(1, total_laps + 1):
                driver_lap = dl[dl['LapNumber'] == lap_num]
                if driver_lap.empty or lap_num not in leader_times:
                    gaps.append(None)
                    continue
                lap_time = driver_lap['LapTime'].values[0]
                if pd.isna(lap_time):
                    gaps.append(None)
                    continue
                diff = pd.Timedelta(lap_time).total_seconds() - leader_times[lap_num]
                gaps.append(round(diff, 3))
            gap_data[driver] = gaps

        return {
            "drivers": drivers,
            "gap_data": gap_data,
            "total_laps": total_laps
        }

    return get_cached(cache_key, fetch)

@router.get("/sectors")
def get_sectors(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):
    cache_key = f"sectors_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'R')
        session.load()
        laps = session.laps
        drivers = laps['Driver'].unique().tolist()
        sector_data = {}

        for driver in drivers:
            dl = laps.pick_drivers(driver)
            sector_data[driver] = {
                "s1": [round(x, 3) if pd.notna(x) else None for x in dl['Sector1Time'].dt.total_seconds()],
                "s2": [round(x, 3) if pd.notna(x) else None for x in dl['Sector2Time'].dt.total_seconds()],
                "s3": [round(x, 3) if pd.notna(x) else None for x in dl['Sector3Time'].dt.total_seconds()],
            }

        return {
            "drivers": drivers,
            "sector_data": sector_data,
            "total_laps": int(laps['LapNumber'].max())
        }

    return get_cached(cache_key, fetch)

@router.get("/h2h")
def get_h2h(year: int, driver1: str, driver2: str):
    # cache both orderings so VER vs LEC and LEC vs VER hit same cache
    key_a = f"h2h_{year}_{driver1}_{driver2}"
    key_b = f"h2h_{year}_{driver2}_{driver1}"
    with _cache_lock:
        if key_a in _cache:
            print(f"Cache hit: {key_a}")
            return _cache[key_a]
        if key_b in _cache:
            print(f"Cache hit: {key_b}")
            return _cache[key_b]

    results = {driver1: [], driver2: []}
    race_names = []
    stats = {
        driver1: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'dnfs': 0, 'positions': []},
        driver2: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'dnfs': 0, 'positions': []}
    }

    try:
        # fetch all races in parallel batches
        all_races = []
        offset = 0
        while True:
            r = req.get(
                f'https://api.jolpi.ca/ergast/f1/{year}/results/?limit=30&offset={offset}',
                timeout=20
            )
            data = r.json()
            batch = data['MRData']['RaceTable']['Races']
            if not batch:
                break
            all_races.extend(batch)
            total = int(data['MRData']['total'])
            offset += 30
            if offset >= total:
                break

        # deduplicate
        seen = set()
        races = []
        for r in all_races:
            if r['raceName'] not in seen:
                seen.add(r['raceName'])
                races.append(r)

        for race in races:
            name = race['raceName'].replace(' Grand Prix', '').replace(' Grande Prémio', '')
            race_names.append(name)
            race_results = {}
            for res in race['Results']:
                code = res['Driver'].get('code', res['Driver']['driverId'][:3].upper())
                race_results[code] = res

            for driver in [driver1, driver2]:
                if driver in race_results:
                    res = race_results[driver]
                    pos = int(res['position'])
                    pts = float(res['points'])
                    status = res['status']
                    results[driver].append(pos)
                    stats[driver]['positions'].append(pos)
                    stats[driver]['points'] += pts
                    if pos == 1: stats[driver]['wins'] += 1
                    if pos <= 3: stats[driver]['podiums'] += 1
                    if status not in ['Finished'] and '+' not in status:
                        stats[driver]['dnfs'] += 1
                else:
                    results[driver].append(20)
                    stats[driver]['positions'].append(20)

        # fetch qualifying for poles
        all_quali = []
        offset = 0
        while True:
            r2 = req.get(
                f'https://api.jolpi.ca/ergast/f1/{year}/qualifying/?limit=30&offset={offset}',
                timeout=20
            )
            qdata = r2.json()
            batch = qdata['MRData']['RaceTable']['Races']
            if not batch:
                break
            all_quali.extend(batch)
            total = int(qdata['MRData']['total'])
            offset += 30
            if offset >= total:
                break

        seen_q = set()
        deduped_quali = []
        for r in all_quali:
            if r['raceName'] not in seen_q:
                seen_q.add(r['raceName'])
                deduped_quali.append(r)

        for race in deduped_quali:
            for res in race['QualifyingResults']:
                code = res['Driver'].get('code', '').upper()
                if res['position'] == '1':
                    if code == driver1: stats[driver1]['poles'] += 1
                    elif code == driver2: stats[driver2]['poles'] += 1

    except Exception as e:
        print(f"H2H Error: {e}")
        return {"error": str(e)}

    for driver in [driver1, driver2]:
        positions = [p for p in stats[driver]['positions'] if p < 20]
        stats[driver]['avgFinish'] = round(sum(positions) / len(positions), 1) if positions else 0

    h2h_wins = {driver1: 0, driver2: 0}
    for i in range(min(len(results[driver1]), len(results[driver2]))):
        if results[driver1][i] < results[driver2][i]: h2h_wins[driver1] += 1
        elif results[driver2][i] < results[driver1][i]: h2h_wins[driver2] += 1

    result = {
        "driver1": driver1,
        "driver2": driver2,
        "year": year,
        "race_names": race_names,
        "results": results,
        "stats": stats,
        "h2h_wins": h2h_wins
    }

    with _cache_lock:
        _cache[key_a] = result

    return result

@router.get("/standings/drivers")
def get_driver_standings(year: int):
    cache_key = f"standings_drivers_{year}"

    def fetch():
        r = req.get(
            f'https://api.jolpi.ca/ergast/f1/{year}/driverStandings/?limit=30',
            timeout=15
        )
        data = r.json()
        standings = data['MRData']['StandingsTable']['StandingsLists']
        if not standings:
            return {"standings": []}
        drivers = []
        for d in standings[0]['DriverStandings']:
            drivers.append({
                'position': int(d['position']),
                'name': f"{d['Driver']['givenName']} {d['Driver']['familyName']}",
                'code': d['Driver'].get('code', d['Driver']['driverId'][:3].upper()),
                'team': d['Constructors'][0]['name'] if d['Constructors'] else 'Unknown',
                'points': float(d['points']),
                'wins': int(d['wins']),
                'nationality': d['Driver']['nationality'],
            })
        return {"standings": drivers, "year": year, "round": standings[0].get('round', '?')}

    try:
        return get_cached(cache_key, fetch)
    except Exception as e:
        return {"error": str(e)}

@router.get("/standings/constructors")
def get_constructor_standings(year: int):
    cache_key = f"standings_constructors_{year}"

    def fetch():
        r = req.get(
            f'https://api.jolpi.ca/ergast/f1/{year}/constructorStandings/?limit=15',
            timeout=15
        )
        data = r.json()
        standings = data['MRData']['StandingsTable']['StandingsLists']
        if not standings:
            return {"standings": []}
        teams = []
        for t in standings[0]['ConstructorStandings']:
            teams.append({
                'position': int(t['position']),
                'name': t['Constructor']['name'],
                'nationality': t['Constructor']['nationality'],
                'points': float(t['points']),
                'wins': int(t['wins']),
            })
        return {"standings": teams, "year": year, "round": standings[0].get('round', '?')}

    try:
        return get_cached(cache_key, fetch)
    except Exception as e:
        return {"error": str(e)}