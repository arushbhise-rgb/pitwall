from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from functools import lru_cache
import os
import threading
import requests as req
import time
import fastf1

POPULAR_RACES = [
    (2026, 'Chinese Grand Prix'),
    (2024, 'Monaco Grand Prix'),
    (2024, 'British Grand Prix'),
    (2023, 'British Grand Prix'),
]

def precache_races():
    time.sleep(10)  # wait for app to fully start
    for year, gp in POPULAR_RACES:
        try:
            cache_key = f"race_{year}_{gp}"
            with _cache_lock:
                if cache_key in _cache:
                    continue
            session = fastf1.get_session(year, gp, 'R')
            session.load()
            print(f"Pre-cached: {year} {gp}")
        except Exception as e:
            print(f"Pre-cache failed for {year} {gp}: {e}")

threading.Thread(target=precache_races, daemon=True).start()

def keep_alive():
    while True:
        try:
            req.get('https://pitwall-production-c292.up.railway.app/health', timeout=10)
        except:
            pass
        time.sleep(600)

threading.Thread(target=keep_alive, daemon=True).start()

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pitwall-f1.com",
        "https://www.pitwall-f1.com",
        "https://pitwall-nine.vercel.app",
        "http://localhost:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import race, ai
app.include_router(race.router)
app.include_router(ai.router)

@app.get("/health")
def health():
    return {"status": "ok"}