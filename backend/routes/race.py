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