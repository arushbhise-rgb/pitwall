from fastapi import APIRouter, Query, HTTPException, Header
import fastf1
import pandas as pd
import threading
from concurrent.futures import ThreadPoolExecutor
import requests as req
import json
import os
import hashlib
import time
import logging

logger = logging.getLogger(__name__)

_cache = {}
_cache_lock = threading.Lock()
_fetch_locks = {}
_fetch_locks_lock = threading.Lock()

DISK_CACHE_DIR = '/app/processed_cache'
os.makedirs(DISK_CACHE_DIR, exist_ok=True)

def disk_cache_path(key):
    safe = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(DISK_CACHE_DIR, f"{safe}.json")

def get_cached(key, fn):
    with _cache_lock:
        if key in _cache:
            logger.info(f"Cache hit (memory): {key}")
            return _cache[key]

    path = disk_cache_path(key)
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                result = json.load(f)
            with _cache_lock:
                _cache[key] = result
            logger.info(f"Cache hit (disk): {key}")
            return result
        except Exception as e:
            logger.warning(f"Disk cache read failed: {e}")

    with _fetch_locks_lock:
        if key not in _fetch_locks:
            _fetch_locks[key] = threading.Lock()
        key_lock = _fetch_locks[key]

    with key_lock:
        with _cache_lock:
            if key in _cache:
                logger.info(f"Cache hit (after lock): {key}")
                return _cache[key]

        logger.info(f"Cache miss: {key} — fetching...")
        result = fn()

        with _cache_lock:
            _cache[key] = result

        try:
            with open(disk_cache_path(key), 'w') as f:
                json.dump(result, f)
            logger.info(f"Disk cache written: {key}")
        except Exception as e:
            logger.warning(f"Disk cache write failed: {e}")

        return result

# TTL-aware cache for data that changes (like current season standings)
_ttl_cache = {}

def get_cached_ttl(key, fn, ttl_seconds=3600):
    """Cache with time-based expiry. Falls back to stale data if refresh fails."""
    now = time.time()

    with _cache_lock:
        if key in _ttl_cache:
            entry = _ttl_cache[key]
            if now - entry['ts'] < ttl_seconds:
                logger.info(f"TTL cache hit (memory): {key}")
                return entry['data']
            logger.info(f"TTL cache expired (memory): {key}")

    path = disk_cache_path(f"ttl_{key}")
    stale_data = None
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                entry = json.load(f)
            if now - entry.get('ts', 0) < ttl_seconds:
                with _cache_lock:
                    _ttl_cache[key] = entry
                logger.info(f"TTL cache hit (disk): {key}")
                return entry['data']
            stale_data = entry['data']
        except Exception:
            pass

    try:
        logger.info(f"TTL cache miss: {key} — fetching fresh...")
        result = fn()
        entry = {'data': result, 'ts': now}
        with _cache_lock:
            _ttl_cache[key] = entry
        try:
            with open(path, 'w') as f:
                json.dump(entry, f)
        except Exception:
            pass
        return result
    except Exception as e:
        if stale_data:
            logger.warning(f"TTL fetch failed, using stale cache: {key}")
            return stale_data
        raise e

CURRENT_SEASON = 2025

fastf1.Cache.enable_cache('cache')
router = APIRouter()

@router.get("/race")
def get_race(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):
    cache_key = f"race_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'R')
        session.load(
            telemetry=False,
            weather=False,
            messages=False,
            livedata=None
        )
        laps = session.laps
        drivers = laps['Driver'].unique().tolist()
        position_data = {}
        lap_time_data = {}
        tire_data = {}
        for driver in drivers:
            dl = laps.pick_drivers(driver)
            positions = dl['Position'].ffill().fillna(0).astype(int).tolist()
            position_data[driver] = positions
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
        session.load(telemetry=False, weather=False, messages=False)
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
        return {"drivers": drivers, "gap_data": gap_data, "total_laps": total_laps}

    return get_cached(cache_key, fetch)


@router.get("/sectors")
def get_sectors(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):
    cache_key = f"sectors_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'R')
        session.load(telemetry=False, weather=False, messages=False)
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
        return {"drivers": drivers, "sector_data": sector_data, "total_laps": int(laps['LapNumber'].max())}

    return get_cached(cache_key, fetch)

def _fetch_with_retry(url, timeout=20, retries=3):
    """Fetch a URL with retry logic."""
    for attempt in range(retries):
        try:
            r = req.get(url, timeout=timeout)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt < retries - 1:
                import time
                time.sleep(1 * (attempt + 1))
            else:
                raise e

def _fetch_all_paginated(url, timeout=20):
    """Fetch all pages from a paginated Ergast API endpoint."""
    data = _fetch_with_retry(f'{url}?limit=100&offset=0', timeout=timeout)
    races = list(data['MRData']['RaceTable']['Races'])
    total = int(data['MRData']['total'])
    if total <= 100:
        return races

    # Fetch remaining pages sequentially to avoid rate limits
    for offset in range(100, total, 100):
        page = _fetch_with_retry(f'{url}?limit=100&offset={offset}', timeout=timeout)
        races.extend(page['MRData']['RaceTable']['Races'])
    return races

def _dedup_races(races):
    seen = set()
    result = []
    for r in races:
        if r['raceName'] not in seen:
            seen.add(r['raceName'])
            result.append(r)
    return result

@router.get("/h2h")
def get_h2h(year: int = Query(..., ge=2018, le=2030), driver1: str = Query(..., min_length=2, max_length=5), driver2: str = Query(..., min_length=2, max_length=5)):
    # Normalize key so VER vs LEC and LEC vs VER share cache
    d1, d2 = sorted([driver1, driver2])
    cache_key = f"h2h_{year}_{d1}_{d2}"

    def fetch():
        results = {driver1: [], driver2: []}
        race_names = []
        stats = {
            driver1: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'dnfs': 0, 'positions': []},
            driver2: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'dnfs': 0, 'positions': []}
        }

        # Fetch race results and qualifying in parallel
        with ThreadPoolExecutor(max_workers=2) as pool:
            race_future = pool.submit(_fetch_all_paginated, f'https://api.jolpi.ca/ergast/f1/{year}/results/')
            quali_future = pool.submit(_fetch_all_paginated, f'https://api.jolpi.ca/ergast/f1/{year}/qualifying/')
            all_races = race_future.result()
            all_quali = quali_future.result()

        races = _dedup_races(all_races)

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

        for race in _dedup_races(all_quali):
            for res in race['QualifyingResults']:
                code = res['Driver'].get('code', '').upper()
                if res['position'] == '1':
                    if code == driver1: stats[driver1]['poles'] += 1
                    elif code == driver2: stats[driver2]['poles'] += 1

        for driver in [driver1, driver2]:
            positions = [p for p in stats[driver]['positions'] if p < 20]
            stats[driver]['avgFinish'] = round(sum(positions) / len(positions), 1) if positions else 0

        h2h_wins = {driver1: 0, driver2: 0}
        for i in range(min(len(results[driver1]), len(results[driver2]))):
            if results[driver1][i] < results[driver2][i]: h2h_wins[driver1] += 1
            elif results[driver2][i] < results[driver1][i]: h2h_wins[driver2] += 1

        return {
            "driver1": driver1, "driver2": driver2, "year": year,
            "race_names": race_names, "results": results,
            "stats": stats, "h2h_wins": h2h_wins
        }

    try:
        return get_cached(cache_key, fetch)
    except Exception as e:
        logger.error(f"H2H Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/standings/drivers")
def get_driver_standings(year: int = Query(..., ge=2018, le=2030)):
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
        if year >= CURRENT_SEASON:
            return get_cached_ttl(cache_key, fetch, ttl_seconds=3600)
        return get_cached(cache_key, fetch)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/standings/constructors")
def get_constructor_standings(year: int = Query(..., ge=2018, le=2030)):
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
        if year >= CURRENT_SEASON:
            return get_cached_ttl(cache_key, fetch, ttl_seconds=3600)
        return get_cached(cache_key, fetch)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cache/clear-standings")
def clear_standings_cache(x_admin_key: str = Header(default=None)):
    admin_key = os.environ.get("ADMIN_KEY")
    if admin_key and x_admin_key != admin_key:
        raise HTTPException(status_code=403, detail="Forbidden")
    """Clear cached standings so next request fetches fresh data."""
    cleared = []
    with _cache_lock:
        keys_to_remove = [k for k in _ttl_cache if 'standings' in k]
        for k in keys_to_remove:
            del _ttl_cache[k]
            cleared.append(k)
        keys_to_remove = [k for k in _cache if 'standings' in k]
        for k in keys_to_remove:
            del _cache[k]
            cleared.append(k)
    # Also clear disk cache for standings
    for k in cleared:
        for prefix in ['', 'ttl_']:
            path = disk_cache_path(f"{prefix}{k}")
            if os.path.exists(path):
                os.remove(path)
    return {"cleared": cleared, "message": "Standings cache cleared"}

@router.get("/calendar")
def get_calendar(year: int = Query(..., ge=2018, le=2030)):
    cache_key = f"calendar_{year}"

    def fetch():
        schedule = fastf1.get_event_schedule(year)
        filtered = schedule[schedule['EventFormat'] != 'testing'].copy()
        if filtered['EventDate'].dt.tz is None:
            filtered['EventDate'] = filtered['EventDate'].dt.tz_localize('UTC')
        races = []
        for _, row in filtered.iterrows():
            races.append({
                'round': int(row['RoundNumber']),
                'name': str(row['EventName']),
                'location': str(row['Location']),
                'country': str(row['Country']),
                'date': row['EventDate'].isoformat(),
            })
        return {"races": races, "year": year}

    try:
        return get_cached(cache_key, fetch)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/driver/stats")
def get_driver_stats(year: int = Query(..., ge=2018, le=2030), driver: str = Query(..., min_length=2)):
    cache_key = f"driver_stats_{year}_{driver}"

    def fetch():
        r = req.get(
            f'https://api.jolpi.ca/ergast/f1/{year}/drivers/{driver}/results/?limit=30',
            timeout=15
        )
        data = r.json()
        races = data['MRData']['RaceTable']['Races']
        stats = {
            'points': 0, 'wins': 0, 'podiums': 0,
            'dnfs': 0, 'positions': [], 'race_results': []
        }
        for race in races:
            if not race['Results']:
                continue
            res = race['Results'][0]
            pos = int(res['position'])
            pts = float(res['points'])
            status = res['status']
            stats['points'] += pts
            stats['positions'].append(pos)
            if pos == 1: stats['wins'] += 1
            if pos <= 3: stats['podiums'] += 1
            if status not in ['Finished'] and '+' not in status:
                stats['dnfs'] += 1
            stats['race_results'].append({
                'race': race['raceName'].replace(' Grand Prix', ''),
                'position': pos,
                'points': pts,
                'status': status,
            })

        # get qualifying for poles
        r2 = req.get(
            f'https://api.jolpi.ca/ergast/f1/{year}/drivers/{driver}/qualifying/?limit=30',
            timeout=15
        )
        qdata = r2.json()
        poles = sum(
            1 for race in qdata['MRData']['RaceTable']['Races']
            if race['QualifyingResults'] and race['QualifyingResults'][0]['position'] == '1'
        )
        stats['poles'] = poles
        valid = [p for p in stats['positions'] if p < 20]
        stats['avgFinish'] = round(sum(valid) / len(valid), 1) if valid else 0
        stats['races'] = len(races)
        stats['bestFinish'] = min(stats['positions']) if stats['positions'] else 0
        return stats

    try:
        return get_cached(cache_key, fetch)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/standings/points-progress")
def get_points_progress(year: int = Query(..., ge=2018, le=2030)):
    cache_key = f"points_progress_{year}"

    def fetch():
        all_races = _fetch_all_paginated(f'https://api.jolpi.ca/ergast/f1/{year}/results/')
        races = _dedup_races(all_races)
        drivers = {}
        race_names = []
        for race in races:
            name = race['raceName'].replace(' Grand Prix', '').replace(' Grande Prémio', '')
            race_names.append(name)
            race_pts = {}
            for res in race['Results']:
                code = res['Driver'].get('code', res['Driver']['driverId'][:3].upper())
                pts = float(res['points'])
                full_name = f"{res['Driver']['givenName']} {res['Driver']['familyName']}"
                race_pts[code] = (pts, full_name)
                if code not in drivers:
                    drivers[code] = {'name': full_name, 'cumulative': []}
            for code in list(drivers.keys()):
                prev = drivers[code]['cumulative'][-1] if drivers[code]['cumulative'] else 0
                drivers[code]['cumulative'].append(round(prev + race_pts.get(code, (0, ''))[0], 1))
        return {"race_names": race_names, "drivers": drivers, "year": year}

    try:
        if year >= CURRENT_SEASON:
            return get_cached_ttl(cache_key, fetch, ttl_seconds=3600)
        return get_cached(cache_key, fetch)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/telemetry")
def get_telemetry(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):
    cache_key = f"telemetry_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'R')
        session.load(telemetry=True, weather=False, messages=False)
        laps = session.laps
        drivers = laps['Driver'].unique().tolist()
        telemetry_data = {}
        for driver in drivers:
            try:
                dl = laps.pick_drivers(driver)
                fastest = dl.pick_fastest()
                if fastest is None or (hasattr(fastest, 'empty') and fastest.empty):
                    continue
                tel = fastest.get_telemetry()
                if tel is None or tel.empty:
                    continue
                telemetry_data[driver] = {
                    'distance': tel['Distance'].round(1).tolist(),
                    'speed': tel['Speed'].round(1).tolist(),
                    'throttle': tel['Throttle'].round(1).tolist(),
                    'gear': tel['nGear'].astype(int).tolist(),
                    'lap': int(fastest['LapNumber'])
                }
            except Exception as ex:
                logger.warning(f"Telemetry error for {driver}: {ex}")
                continue
        return {"drivers": list(telemetry_data.keys()), "telemetry_data": telemetry_data, "year": year, "gp": gp}

    return get_cached(cache_key, fetch)


@router.get("/qualifying")
def get_qualifying(year: int = Query(..., ge=2018, le=2030), gp: str = Query(..., min_length=3)):
    cache_key = f"qualifying_{year}_{gp}"

    def fetch():
        session = fastf1.get_session(year, gp, 'Q')
        session.load(telemetry=False, weather=False, messages=False)
        results = session.results

        quali_data = {}
        for _, row in results.iterrows():
            abbr = row['Abbreviation']

            def parse_time(val):
                if pd.isna(val):
                    return None
                try:
                    return round(float(val), 3)
                except Exception:
                    try:
                        return round(pd.Timedelta(val).total_seconds(), 3)
                    except Exception:
                        return None

            q1 = parse_time(row.get('Q1'))
            q2 = parse_time(row.get('Q2'))
            q3 = parse_time(row.get('Q3'))
            best = min([t for t in [q1, q2, q3] if t is not None], default=None)

            quali_data[abbr] = {
                'q1': q1,
                'q2': q2,
                'q3': q3,
                'best': best
            }

        driver_info = {}
        for _, row in results.iterrows():
            abbr = row['Abbreviation']
            driver_info[abbr] = {
                'fullName': row['FullName'],
                'teamName': row['TeamName'],
                'teamColor': '#' + str(row['TeamColor']) if pd.notna(row['TeamColor']) else '#888888',
                'position': int(row['Position']) if pd.notna(row['Position']) else 99,
            }

        sorted_drivers = sorted(
            list(quali_data.keys()),
            key=lambda d: driver_info.get(d, {}).get('position', 99)
        )

        pole_time = None
        for d in sorted_drivers:
            if quali_data[d]['best'] is not None:
                pole_time = quali_data[d]['best']
                break

        return {
            'drivers': sorted_drivers,
            'quali_data': quali_data,
            'driver_info': driver_info,
            'pole_time': pole_time,
            'gp': gp,
            'year': year
        }

    try:
        return get_cached(cache_key, fetch)
    except Exception as e:
        return {'error': str(e)}
