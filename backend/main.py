from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import os
import logging
import threading
import requests as req
import time
import fastf1

load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("pitwall")

# Validate required env vars
if not os.getenv("OPENAI_API_KEY"):
    logger.warning("OPENAI_API_KEY not set — /analyze endpoint will fail")

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "https://pitwall-f1.com,https://www.pitwall-f1.com,https://pitwall-nine.vercel.app,http://localhost:5173").split(",")

app = FastAPI()

app.add_middleware(GZipMiddleware, minimum_size=500)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routes import race, ai
from routes.race import get_cached, _cache, _cache_lock

app.state.limiter = ai.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(race.router)
app.include_router(ai.router)

@app.get("/health")
def health():
    return {"status": "ok"}

POPULAR_RACES = [
    (2026, 'Australian Grand Prix'),
    (2026, 'Chinese Grand Prix'),
    (2025, 'Australian Grand Prix'),
    (2024, 'Monaco Grand Prix'),
    (2024, 'British Grand Prix'),
    (2023, 'British Grand Prix'),
]

KEEP_ALIVE_URL = os.getenv("KEEP_ALIVE_URL", "https://pitwall-production-c292.up.railway.app/health")

def precache_races():
    time.sleep(10)
    import pandas as pd
    for year, gp in POPULAR_RACES:
        try:
            cache_key = f"race_{year}_{gp}"
            with _cache_lock:
                if cache_key in _cache:
                    logger.info(f"Already cached: {year} {gp}")
                    continue

            def fetch(y=year, g=gp):
                session = fastf1.get_session(y, g, 'R')
                session.load(telemetry=False, weather=False, messages=False)
                laps = session.laps
                drivers = laps['Driver'].unique().tolist()
                position_data = {}
                lap_time_data = {}
                tire_data = {}
                for driver in drivers:
                    dl = laps.pick_drivers(driver)
                    position_data[driver] = dl['Position'].ffill().fillna(0).astype(int).tolist()
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
                    "gp": g,
                    "year": y
                }

            get_cached(cache_key, fetch)
            logger.info(f"Pre-cached: {year} {gp}")
            time.sleep(2)

        except Exception as e:
            logger.error(f"Pre-cache failed for {year} {gp}: {e}")

def keep_alive():
    while True:
        try:
            req.get(KEEP_ALIVE_URL, timeout=10)
        except Exception:
            pass
        time.sleep(600)

threading.Thread(target=precache_races, daemon=True).start()
threading.Thread(target=keep_alive, daemon=True).start()