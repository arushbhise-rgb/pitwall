from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AnalysisRequest(BaseModel):
    race_summary: str
    question: str

@router.post("/analyze")
def analyze_race(req: AnalysisRequest):
    message = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""You are an expert F1 race analyst. You have access to the following race data:

{req.race_summary}

Answer this question from an F1 fan: {req.question}

Be specific, use the data provided, keep your answer under 150 words.
Write like a knowledgeable F1 analyst, not an AI."""
        }]
    )
    return {"response": message.choices[0].message.content}