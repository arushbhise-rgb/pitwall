from fastapi import APIRouter
from pydantic import BaseModel
import os

router = APIRouter()

class AnalysisRequest(BaseModel):
    race_summary: str
    question: str

@router.post("/analyze")
def analyze_race(req: AnalysisRequest):
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    message = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1024,
        messages=[
            {
                "role": "system",
                "content": """You are an F1 race analyst. You have been given complete lap by lap position data for a race.

CRITICAL RULES:
- ONLY use the data provided. Never invent, guess, or use outside knowledge for specific positions.
- If asked about a specific lap and position, find that exact lap in the data and read the position directly.
- If the data does not contain the answer, say "I cannot find that in the race data provided."
- Never mention driver full names that aren't in the data — only use the 3 letter codes given.
- Be concise and factual."""
            },
            {
                "role": "user",
                "content": f"Race data:\n{req.race_summary}\n\nQuestion: {req.question}"
            }
        ]
    )
    return {"response": message.choices[0].message.content}