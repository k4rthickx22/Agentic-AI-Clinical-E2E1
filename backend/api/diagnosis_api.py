from fastapi import APIRouter
from orchestrator.clinical_orchestrator import ClinicalOrchestrator
from services.db_service import save_consultation, get_user_consultations, get_consultations, get_analytics
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi import Request

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY")) if HAS_GROQ and os.getenv("GROQ_API_KEY") else None

router = APIRouter()
orchestrator = ClinicalOrchestrator()


MEDICAL_SYSTEM_PROMPT = """You are Dr. MedAI — a highly experienced, empathetic AI medical assistant designed to help patients understand their health concerns.

Your role is similar to a knowledgeable personal doctor who:
• Provides clear, structured, evidence-based medical information
• Recommends specific medications with dosage when appropriate (with disclaimers)
• Gives tailored lifestyle recommendations (diet, exercise, sleep, stress management)
• Outlines treatment plans step by step
• Flags when a patient needs URGENT in-person medical care
• Always responds with compassion and clarity

IMPORTANT RULES:
1. ALWAYS respond in the SAME LANGUAGE the patient used to ask their question.
   - If they write in Tamil (தமிழ்), respond fully in Tamil
   - If they write in Hindi (हिंदी), respond fully in Hindi
   - If they write in English, respond in English
2. Structure your responses with clear sections using:
   🔍 SUMMARY | 💊 MEDICATION | 🥗 DIET & LIFESTYLE | ⚠️ WHEN TO SEE A DOCTOR
3. Be specific — give actual drug names, dosages, duration when safe to do so
4. Always end with a brief disclaimer: "This is AI guidance, not a substitute for professional medical care."
5. Never refuse to provide medical information — patients need guidance, especially when they can't access a doctor.

You have access to the patient's latest diagnosis context if provided."""


@router.post("/diagnose")
def diagnose(patient_data: dict, request: Request):
    patient_data.setdefault("name", "Anonymous")
    patient_data.setdefault("age", 30)
    patient_data.setdefault("gender", "unknown")
    patient_data.setdefault("allergies", "none")
    patient_data.setdefault("conditions", "none")

    if isinstance(patient_data.get("symptoms"), list):
        patient_data["symptoms"] = " ".join(patient_data["symptoms"])

    # Extract user_id from auth header if present
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        try:
            from auth.auth_handler import get_current_user_id_from_token
            user_id = get_current_user_id_from_token(auth_header.replace("Bearer ", ""))
        except Exception:
            user_id = None
    
    patient_data["user_id"] = user_id

    result = orchestrator.run_pipeline(patient_data)
    save_consultation(patient_data, result)
    return result


@router.get("/history")
def history(request: Request):
    """Get history — for logged-in users, return only their own records."""
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        try:
            from auth.auth_handler import get_current_user_id_from_token
            user_id = get_current_user_id_from_token(auth_header.replace("Bearer ", ""))
        except Exception:
            user_id = None
    
    if user_id:
        return get_user_consultations(user_id)
    else:
        return []  # No history for unauthenticated users


@router.get("/analytics")
def analytics():
    return get_analytics()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    diagnosis_context: dict = {}
    language: str = "en"


@router.post("/chat")
def chat(request: ChatRequest):
    if not groq_client:
        return {"reply": "⚠️ AI Chat is offline. Please add your GROQ_API_KEY to backend/.env and restart the server."}
    
    # Build system prompt with language hint
    system_content = MEDICAL_SYSTEM_PROMPT
    if request.diagnosis_context:
        ctx = request.diagnosis_context
        system_content += f"\n\nCURRENT PATIENT CONTEXT:\n- Diagnosis: {ctx.get('disease', 'Unknown')}\n- Drug: {ctx.get('drug', 'N/A')}\n- Triage: {ctx.get('triage', 'N/A')}\n- Symptoms: {ctx.get('symptoms', 'N/A')}"
    
    # Language hint
    lang_hints = {"ta": "IMPORTANT: The patient is using Tamil. Respond ENTIRELY in Tamil script.", "hi": "IMPORTANT: The patient is using Hindi. Respond ENTIRELY in Hindi script.", "en": ""}
    lang_hint = lang_hints.get(request.language, "")
    if lang_hint:
        system_content = lang_hint + "\n\n" + system_content

    messages = [{"role": "system", "content": system_content}]
    
    for h in request.history:
        role = h.get("role", "user")
        if role not in ("user", "assistant"):
            role = "assistant" if role == "ai" else "user"
        messages.append({"role": role, "content": h["content"]})
    
    messages.append({"role": "user", "content": request.message})

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=1200,
            temperature=0.7
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        print(f"Groq Chat API Error: {e}")
        return {"reply": "I apologize — my AI inference engine is temporarily unavailable. Please try again in a moment."}


class ExplainRequest(BaseModel):
    disease: str
    symptoms: str
    age: int = 30
    gender: str = "unknown"
    conditions: str = "none"
    allergies: str = "none"
    language: str = "en"


EXPLAIN_SYSTEM_PROMPT = """You are Dr. MedAI — an expert AI physician providing personalised medical analysis.

Given a patient's diagnosis and symptoms, provide a comprehensive, structured medical explanation.
Respond STRICTLY in this JSON format (no markdown blocks, pure JSON):
{
  "summary": "2-3 sentence plain-language summary of the condition and why these symptoms match",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "medicines": [
    {"name": "Drug Name + dose", "purpose": "what it does", "timing": "how to take it"},
    {"name": "Drug Name + dose", "purpose": "what it does", "timing": "how to take it"}
  ],
  "lifestyle": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "when_to_seek_care": "Clear, specific emergency warning signs",
  "severity": "mild|moderate|severe",
  "disclaimer": "This is AI medical guidance, not a substitute for professional clinical care."
}

Be specific with drug names, doses, and durations. Tailor all advice to the patient's age, gender, and pre-existing conditions. Always mention contraindications relevant to the patient."""


@router.post("/diagnose/explain")
def diagnose_explain(request: ExplainRequest):
    if not groq_client:
        return {
            "summary": "AI explanation unavailable — GROQ_API_KEY not configured.",
            "causes": ["Unable to connect to AI service"],
            "medicines": [],
            "lifestyle": [],
            "when_to_seek_care": "Consult your physician.",
            "severity": "unknown",
            "disclaimer": "Configure GROQ_API_KEY in backend/.env to enable AI analysis."
        }

    lang_hints = {
        "ta": "RESPOND ENTIRELY IN TAMIL SCRIPT (தமிழ்). All JSON values in Tamil.",
        "hi": "RESPOND ENTIRELY IN HINDI SCRIPT (हिंदी). All JSON values in Hindi.",
        "en": ""
    }
    lang_hint = lang_hints.get(request.language, "")

    patient_context = f"""
Patient Details:
- Diagnosis: {request.disease}
- Reported Symptoms: {request.symptoms}
- Age: {request.age} years
- Gender: {request.gender}
- Pre-existing Conditions: {request.conditions}
- Known Allergies: {request.allergies}
""".strip()

    user_message = f"""{lang_hint}

{patient_context}

Provide a comprehensive, personalised medical explanation for this patient's diagnosis of {request.disease}.
Consider their age, gender, and pre-existing conditions when recommending medicines and lifestyle changes.
If they have allergies, ensure no contraindicated medicines are recommended.
Return ONLY valid JSON, no markdown, no code blocks."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": EXPLAIN_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1500,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        import json
        raw = response.choices[0].message.content
        try:
            parsed = json.loads(raw)
        except Exception:
            # Extract JSON if wrapped in markdown
            import re
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            parsed = json.loads(match.group()) if match else {"summary": raw, "causes": [], "medicines": [], "lifestyle": [], "when_to_seek_care": "", "severity": "unknown", "disclaimer": ""}
        return parsed
    except Exception as e:
        print(f"Groq Explain API Error: {e}")
        return {
            "summary": f"AI analysis temporarily unavailable. Your diagnosis is {request.disease}. Please consult with a healthcare provider for detailed guidance.",
            "causes": ["AI inference engine temporarily offline"],
            "medicines": [],
            "lifestyle": ["Please consult with your healthcare provider"],
            "when_to_seek_care": "Visit your doctor for personalized advice.",
            "severity": "unknown",
            "disclaimer": "This is AI guidance, not a substitute for professional medical care."
        }


from utils.pdf_generator import generate_pdf
from fastapi.responses import FileResponse
import tempfile
import uuid


@router.post("/generate_pdf")
def generate_pdf_endpoint(data: dict):
    temp_dir = tempfile.gettempdir()
    file_name = f"clinical_report_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(temp_dir, file_name)
    
    patient_data = {
        "age": data.get("age", "N/A"),
        "gender": data.get("gender", "N/A"),
        "name": data.get("name", "Anonymous")
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
        "follow_up": "Follow up with a healthcare provider within 3–5 days if symptoms persist."
    }
    
    severity = data.get("triage", "LOW")
    generate_pdf(file_path, patient_data, decision, severity)
    
    return FileResponse(
        path=file_path,
        filename="Clinical_Report.pdf",
        media_type="application/pdf",
        background=None
    )