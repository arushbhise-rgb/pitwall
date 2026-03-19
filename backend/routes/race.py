from fastapi import APIRouter
import fastf1
import pandas as pd

fastf1.Cache.enable_cache('cache')
router = APIRouter()

@router.get("/race")
def get_race(year: int, gp: str):
    session = fastf1.get_session(year, gp, 'R')
    session.load()
    laps = session.laps

    drivers = laps['Driver'].unique().tolist()

    position_data = {}
    lap_time_data = {}
    tire_data = {}

    for driver in drivers:
        dl = laps.pick_driver(driver)
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

@router.get("/races")
def get_races(year: int):
    schedule = fastf1.get_event_schedule(year)
    races = schedule[schedule['EventFormat'] != 'testing']['EventName'].tolist()
    return {"races": races}

@router.get("/h2h")
def get_h2h(year: int, driver1: str, driver2: str):
    import requests as req

    results = {driver1: [], driver2: []}
    race_names = []
    stats = {
        driver1: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'dnfs': 0, 'positions': []},
        driver2: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'dnfs': 0, 'positions': []}
    }

    try:
        r = req.get(f'https://api.jolpi.ca/ergast/f1/{year}/results/?limit=500', timeout=30)
        data = r.json()
        races = data['MRData']['RaceTable']['Races']

        for race in races:
            name = race['raceName'].replace(' Grand Prix','').replace(' Grande Prémio','')
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

        r2 = req.get(f'https://api.jolpi.ca/ergast/f1/{year}/qualifying/?limit=500', timeout=30)
        qdata = r2.json()
        for race in qdata['MRData']['RaceTable']['Races']:
            for res in race['QualifyingResults']:
                code = res['Driver'].get('code', res['Driver']['driverId'][:3].upper())
                if code in [driver1, driver2] and res['position'] == '1':
                    stats[code]['poles'] += 1

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

    for driver in [driver1, driver2]:
        positions = [p for p in stats[driver]['positions'] if p < 20]
        stats[driver]['avgFinish'] = round(sum(positions) / len(positions), 1) if positions else 0

    h2h_wins = {driver1: 0, driver2: 0}
    for i in range(min(len(results[driver1]), len(results[driver2]))):
        if results[driver1][i] < results[driver2][i]: h2h_wins[driver1] += 1
        elif results[driver2][i] < results[driver1][i]: h2h_wins[driver2] += 1

    return {
        "driver1": driver1,
        "driver2": driver2,
        "year": year,
        "race_names": race_names,
        "results": results,
        "stats": stats,
        "h2h_wins": h2h_wins
    }

@router.get("/gap-to-leader")
def get_gap_to_leader(year: int, gp: str):
    session = fastf1.get_session(year, gp, 'R')
    session.load()
    laps = session.laps

    drivers = laps['Driver'].unique().tolist()
    gap_data = {}

    for driver in drivers:
        dl = laps.pick_driver(driver)
        cumulative_times = dl['LapTime'].dt.total_seconds().cumsum()
        gap_data[driver] = [round(x, 3) if pd.notna(x) else None for x in cumulative_times]

    leader = drivers[0]
    leader_times = gap_data[leader]

    relative_gaps = {}
    for driver in drivers:
        gaps = []
        for i, t in enumerate(gap_data[driver]):
            if t is None or i >= len(leader_times) or leader_times[i] is None:
                gaps.append(None)
            else:
                gaps.append(round(t - leader_times[i], 3))
        relative_gaps[driver] = gaps

    return {
        "drivers": drivers,
        "gap_data": relative_gaps,
        "total_laps": int(laps['LapNumber'].max())
    }

@router.get("/sectors")
def get_sectors(year: int, gp: str):
    session = fastf1.get_session(year, gp, 'R')
    session.load()
    laps = session.laps

    drivers = laps['Driver'].unique().tolist()
    sector_data = {}

    for driver in drivers:
        dl = laps.pick_driver(driver)
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