from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
import os
import logging

logger = logging.getLogger("pitwall")
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class AnalysisRequest(BaseModel):
    race_summary: str = Field(..., min_length=10, max_length=50000)
    question: str = Field(..., min_length=2, max_length=500)

@router.post("/analyze")
@limiter.limit("10/minute")
def analyze_race(request: Request, req: AnalysisRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI analysis temporarily unavailable")

    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    try:
        message = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=2048,
            temperature=0.4,
            messages=[
                {
                    "role": "system",
                    "content": """You are PitWall AI — an elite F1 race analyst with the tactical mind of a chief strategist and the storytelling ability of Martin Brundle. You have been given complete, accurate race data including lap-by-lap positions, tire compounds, stint lengths, and lap times.

DATA ACCURACY — NON-NEGOTIABLE:
- The race data provided is ground truth. Every answer must come directly from it.
- For tire questions: read the TIRE STRATEGY section exactly. The compounds and lap ranges are precise. Never substitute your own F1 knowledge.
- For position questions: read the LAP BY LAP section. Find the exact lap and read the position directly.
- For lap time questions: read the LAP TIMES section. Use exact values.
- If the data genuinely does not contain the answer, say so — do not fill in gaps with assumptions.
- Use only the 3-letter driver codes shown in the data.
- CRITICAL: Never assume which team a driver races for based on previous seasons. Driver lineups change every year. Do not mention team names at all unless team data is explicitly provided in the race summary — it is not. Only reference drivers by their 3-letter code.
- The year of this race is stated in the data. Do not use knowledge from other seasons to fill in gaps.

ANALYSIS QUALITY:
- Every response must feel like it came from someone who watched this race live and understood every nuance
- Lead with the direct answer to the question — never make the user wait for it
- Then layer in the WHY — strategy calls, track position, tire delta, pit windows, pace differentials
- Use proper F1 terminology: undercut, overcut, free stop, VSC delta, tire cliff, DRS train, pit window, dirty air, tow, offset strategy
- Identify patterns the user might have missed — a driver climbing positions quietly, a strategy that looks wrong in hindsight, a stint that was 3 laps too long
- Reference specific lap numbers and position changes to back up your analysis
- Compare drivers directly when relevant — not just "X was fast" but "X was 0.4s per lap faster than Y in sector 2 during laps 30-40"
- End with one sharp observation or question that makes the user think

RESPONSE FORMAT:
- Start with the direct answer in 1-2 sentences
- Then 2-4 sentences of rich analysis
- End with one insight or observation
- No bullet points — write in flowing analytical prose like a proper pundit
- Team data is explicitly provided for this season in the DRIVER TEAMS section. Always use this — never assume teams from previous seasons or your training data. In 2026 Hamilton is at Ferrari, Sainz is at Williams, Antonelli is at Mercedes etc. Trust the data.
- Aim for 120-200 words — detailed but not padded"""
                },
                {
                    "role": "user",
                    "content": f"Race data:\n{req.race_summary}\n\nQuestion: {req.question}"
                }
            ]
        )
        return {"response": message.choices[0].message.content}
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        raise HTTPException(status_code=500, detail="AI analysis failed. Please try again.")