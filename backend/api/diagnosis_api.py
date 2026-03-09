from fastapi import APIRouter
from orchestrator.clinical_orchestrator import ClinicalOrchestrator
from services.db_service import save_consultation, get_consultations, get_analytics
from pydantic import BaseModel
import os
from dotenv import load_dotenv

try:
    from openai import OpenAI
    HAS_LLM_DEPS = True
except ImportError:
    HAS_LLM_DEPS = False

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if HAS_LLM_DEPS and os.getenv("OPENAI_API_KEY") else None

router = APIRouter()
orchestrator = ClinicalOrchestrator()

@router.post("/diagnose")
def diagnose(patient_data: dict):
    patient_data.setdefault("name", "Anonymous")
    patient_data.setdefault("age", 30)
    patient_data.setdefault("gender", "unknown")
    patient_data.setdefault("allergies", "none")
    patient_data.setdefault("conditions", "none")

    if isinstance(patient_data.get("symptoms"), list):
        patient_data["symptoms"] = " ".join(patient_data["symptoms"])

    result = orchestrator.run_pipeline(patient_data)
    save_consultation(patient_data, result)
    return result

@router.get("/history")
def history():
    return get_consultations()

@router.get("/analytics")
def analytics():
    return get_analytics()

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@router.post("/chat")
def chat(request: ChatRequest):
    if not client:
        return {"reply": "OpenAI API Key not configured. AI chat is offline. Please set your key in the .env file."}
    
    messages = [
        {"role": "system", "content": "You are a professional, highly knowledgeable AI Clinical Assistant. You provide clear, accurate, and empathetic medical guidance. Keep responses concise but highly informative."}
    ]
    for h in request.history:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": request.message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        print(f"Chat API Error: {e}")
        return {"reply": "I apologize, but my AI inference engine is temporarily unavailable (likely due to API quota limits or network issues). Please try again later."}

from utils.pdf_generator import generate_pdf
from fastapi.responses import FileResponse
import tempfile
import uuid

@router.post("/generate_pdf")
def generate_pdf_endpoint(data: dict):
    # Create a temporary file path
    temp_dir = tempfile.gettempdir()
    file_name = f"clinical_report_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(temp_dir, file_name)
    
    patient_data = {
        "age": data.get("age", "N/A"),
        "gender": data.get("gender", "N/A")
    }
    
    decision = {
        "predicted_disease": data.get("disease", "N/A"),
        "symptoms_summary": data.get("symptoms", "N/A"),
        "risk_summary": "Assessed via AI Pipeline.",
        "recommended_drug": data.get("drug", "N/A"),
        "dosage": data.get("dosage", "N/A"),
        "duration": data.get("duration", "N/A"),
        "diet": data.get("lifestyle", []),
        "lifestyle": data.get("lifestyle", []),
        "warnings": data.get("warnings", []),
        "follow_up": "Follow up with a healthcare provider within 3-5 days."
    }
    
    severity = data.get("triage", "LOW")
    
    # Generate the PDF
    generate_pdf(file_path, patient_data, decision, severity)
    
    return FileResponse(
        path=file_path, 
        filename="Clinical_Report.pdf", 
        media_type="application/pdf",
        background=None  # Can use background tasks to delete the file later if desired
    )