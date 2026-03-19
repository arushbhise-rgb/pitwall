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
    schedule = fastf1.get_event_schedule(year)
    races = schedule[schedule['EventFormat'] != 'testing']
    
    results = {driver1: [], driver2: []}
    race_names = []
    stats = {
        driver1: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'fastestLaps': 0, 'dnfs': 0, 'positions': []},
        driver2: {'points': 0, 'wins': 0, 'podiums': 0, 'poles': 0, 'fastestLaps': 0, 'dnfs': 0, 'positions': []}
    }

    for _, event in races.iterrows():
        try:
            session = fastf1.get_session(year, event['EventName'], 'R')
            session.load(telemetry=False, weather=False, messages=False)
            res = session.results

            for driver in [driver1, driver2]:
                row = res[res['Abbreviation'] == driver]
                if not row.empty:
                    pos = int(row['Position'].values[0]) if pd.notna(row['Position'].values[0]) else 20
                    status = str(row['Status'].values[0])
                    pts = float(row['Points'].values[0]) if pd.notna(row['Points'].values[0]) else 0
                    results[driver].append(pos)
                    stats[driver]['points'] += pts
                    stats[driver]['positions'].append(pos)
                    if pos == 1: stats[driver]['wins'] += 1
                    if pos <= 3: stats[driver]['podiums'] += 1
                    if 'DNF' in status or 'Retired' in status: stats[driver]['dnfs'] += 1
                else:
                    results[driver].append(20)
                    stats[driver]['positions'].append(20)

            quali = fastf1.get_session(year, event['EventName'], 'Q')
            quali.load(telemetry=False, weather=False, messages=False)
            qres = quali.results
            for driver in [driver1, driver2]:
                row = qres[qres['Abbreviation'] == driver]
                if not row.empty:
                    qpos = int(row['Position'].values[0]) if pd.notna(row['Position'].values[0]) else 20
                    if qpos == 1: stats[driver]['poles'] += 1

            race_names.append(event['EventName'].replace(' Grand Prix','').replace(' Grande Prémio',''))
        except Exception as e:
            print(f"Skipping {event['EventName']}: {e}")
            continue

    for driver in [driver1, driver2]:
        positions = stats[driver]['positions']
        stats[driver]['avgFinish'] = round(sum(positions) / len(positions), 1) if positions else 0

    h2h_wins = {driver1: 0, driver2: 0}
    for i in range(len(results[driver1])):
        if i < len(results[driver2]):
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