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
        messages=[{
            "role": "user",
            "content": f"""You are an expert F1 race analyst with access to complete lap by lap position data for this race.

RACE DATA:
{req.race_summary}

QUESTION: {req.question}

Instructions:
- Use the exact lap by lap data provided to answer precisely
- If asked about a specific lap, look up that exact lap in the data
- Never guess or make up positions — only use what the data shows
- Be concise and specific
- Answer like a knowledgeable F1 engineer, not an AI assistant
- If the data doesn't contain enough info to answer, say so clearly"""
        }]
    )
    return {"response": message.choices[0].message.content}