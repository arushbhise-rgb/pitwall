from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from functools import lru_cache
import os

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