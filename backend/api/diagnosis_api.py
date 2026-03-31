from fastapi import APIRouter, Request
from orchestrator.clinical_orchestrator import ClinicalOrchestrator
from services.db_service import save_consultation, get_user_consultations, get_consultations, get_analytics, get_user_analytics, delete_user_history, update_last_consultation
from pydantic import BaseModel
import os
from dotenv import load_dotenv

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

# Load .env from backend root — explicit path so it works regardless of CWD
_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=_env_path, override=True)
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
1. ALWAYS respond in the language specified by the LANGUAGE TAG provided in the system prompt.
   - If language=en is set, respond ENTIRELY in English — even if the patient wrote in Tamil or Hindi
   - If language=ta is set, respond ENTIRELY in Tamil script
   - If language=hi is set, respond ENTIRELY in Hindi script
   - The language TAG always overrides the script used in the message
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
def analytics(request: Request):
    """Return analytics — scoped to the logged-in user when authenticated."""
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        try:
            from auth.auth_handler import get_current_user_id_from_token
            user_id = get_current_user_id_from_token(auth_header.replace("Bearer ", ""))
        except Exception:
            user_id = None

    if user_id:
        return get_user_analytics(user_id)
    return get_analytics()


@router.delete("/history")
def clear_history(request: Request):
    """Delete all consultation records for the authenticated user."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        from auth.auth_handler import get_current_user_id_from_token
        user_id = get_current_user_id_from_token(auth_header.replace("Bearer ", ""))
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid token")

    deleted = delete_user_history(user_id)
    return {"deleted": deleted, "message": f"Cleared {deleted} consultation(s) successfully"}



class CorrectConsultationRequest(BaseModel):
    disease: str
    drug: str
    dosage: str = "As prescribed"
    duration: str = "As advised"
    lifestyle: list = []
    warnings: list = []
    treatment_plan: list = []
    when_to_seek_care: str = ""


@router.patch("/consultation/correct")
def correct_last_consultation(body: CorrectConsultationRequest, request: Request):
    """
    Called by the frontend after Groq fallback overrides the ML model prediction.
    Patches the most-recently saved consultation record with the correct Groq diagnosis
    so that History and Profile show the same disease the user saw on screen.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        # No auth — silently skip (user not logged in, no record to fix)
        return {"updated": False, "reason": "unauthenticated"}
    try:
        from auth.auth_handler import get_current_user_id_from_token
        user_id = get_current_user_id_from_token(auth_header.replace("Bearer ", ""))
    except Exception:
        return {"updated": False, "reason": "invalid_token"}

    updated = update_last_consultation(
        user_id=user_id,
        disease=body.disease,
        drug=body.drug,
        dosage=body.dosage,
        duration=body.duration,
        lifestyle=body.lifestyle,
        warnings=body.warnings,
        treatment_plan=body.treatment_plan,
        when_to_seek_care=body.when_to_seek_care,
    )
    return {"updated": updated}


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
    lang_hints = {
        "ta": "CRITICAL LANGUAGE RULE: language=ta. You MUST respond ENTIRELY in Tamil script. Never use English, Hindi, or any other language in your response.",
        "hi": "CRITICAL LANGUAGE RULE: language=hi. You MUST respond ENTIRELY in Hindi (Devanagari script). Never use English, Tamil, or any other language in your response.",
        "en": "CRITICAL LANGUAGE RULE: language=en. You MUST respond ENTIRELY in ENGLISH. Never use Tamil, Hindi, or any other language regardless of what language the question is in.",
    }
    lang_hint = lang_hints.get(request.language, "")
    # lang_hint will be appended at end for highest priority (see below)

    # Place language rule after system content so it takes highest priority
    final_system = system_content + "\n\n" + lang_hint if lang_hint else system_content
    messages = [{"role": "system", "content": final_system}]
    
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


class ExtendedRequest(BaseModel):
    symptoms: str
    age: int = 30
    gender: str = "unknown"
    conditions: str = "none"
    allergies: str = "none"
    language: str = "en"
    confidence_score: float = 1.0          # Pass from frontend if available
    disease_in_db: bool = True             # Whether primary diagnosis was in DB


@router.post("/diagnose/extended")
def diagnose_extended(request: ExtendedRequest):
    """
    Extended Clinical Module — handles:
    - Musculoskeletal pain, injuries, nerve pain, skin, digestive, EENT, general
    - Pediatric (<12) and Geriatric (>65) age-specific guidance
    - Low-confidence / no-DB-match fallback
    """
    from agents.extended_clinical_module import (
        check_extended_trigger, get_extended_category,
        check_emergency_escalation, build_extended_prompt,
        EXTENDED_SYSTEM_PROMPT
    )

    # 1. Check if extended module should activate
    should_activate = check_extended_trigger(
        request.symptoms,
        request.confidence_score,
        request.disease_in_db
    )

    if not should_activate:
        return {
            "activated": False,
            "message": "Primary diagnosis DB match found with high confidence. Extended module not required.",
            "categories": []
        }

    # 2. Emergency screening (always first)
    emergency_flag = check_emergency_escalation(request.symptoms)

    # 3. Detect symptom categories
    categories = get_extended_category(request.symptoms)

    # 4. If no Groq, return structured fallback
    if not groq_client:
        return {
            "activated": True,
            "categories": categories,
            "emergency_detected": bool(emergency_flag),
            "emergency_message": emergency_flag,
            "summary": "AI Extended Module unavailable — GROQ_API_KEY not configured.",
            "probable_causes": [],
            "immediate_home_care": ["Consult a healthcare professional for guidance."],
            "otc_medication": {},
            "physio_advice": [],
            "when_to_see_doctor": ["Please visit a doctor for evaluation of your symptoms."],
            "emergency_signs": [emergency_flag] if emergency_flag else [],
            "source": "CLINICAL_KNOWLEDGE",
            "severity": "unknown",
            "age_flag": None,
            "disclaimer": "AI-assisted guidance only. Consult a licensed physician for diagnosis and treatment."
        }

    # 5. Build Groq prompt using extended module
    user_message = build_extended_prompt(
        symptoms=request.symptoms,
        age=request.age,
        gender=request.gender,
        conditions=request.conditions,
        allergies=request.allergies,
        language=request.language,
        categories=categories,
        emergency_flag=emergency_flag
    )

    try:
        import json as _json
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": EXTENDED_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1800,
            temperature=0.35,
            response_format={"type": "json_object"}
        )
        raw = response.choices[0].message.content
        try:
            parsed = _json.loads(raw)
        except Exception:
            import re as _re
            match = _re.search(r'\{.*\}', raw, _re.DOTALL)
            parsed = _json.loads(match.group()) if match else {}

        # Inject emergency flag if AI missed it
        if emergency_flag and not parsed.get("emergency_signs"):
            parsed["emergency_signs"] = [emergency_flag]

        parsed["activated"] = True
        parsed["categories"] = categories
        parsed["emergency_detected"] = bool(emergency_flag)
        return parsed

    except Exception as e:
        print(f"Groq Extended API Error: {e}")
        return {
            "activated": True,
            "categories": categories,
            "emergency_detected": bool(emergency_flag),
            "emergency_message": emergency_flag,
            "summary": f"Extended AI module temporarily unavailable. Your symptoms ({request.symptoms[:80]}...) should be evaluated by a healthcare provider.",
            "probable_causes": [{"rank": 1, "cause": "AI analysis unavailable", "reason": "Groq inference engine offline"}],
            "immediate_home_care": ["Rest and monitor symptoms", "Stay hydrated", "Consult a doctor if symptoms worsen"],
            "otc_medication": {"drug": "Paracetamol 500mg", "frequency": "Every 6 hours if needed", "max_duration": "3 days", "avoid_if": "Liver disease or allergy", "alternative": "Ibuprofen 400mg (with food)"},
            "physio_advice": [],
            "when_to_see_doctor": ["If symptoms worsen within 24 hours", "If no improvement in 3 days"],
            "emergency_signs": [emergency_flag] if emergency_flag else [],
            "source": "CLINICAL_KNOWLEDGE",
            "severity": "unknown",
            "age_flag": None,
            "disclaimer": "AI-assisted guidance only. Consult a licensed physician for diagnosis and treatment."
        }


class GrokFallbackRequest(BaseModel):
    symptoms: str
    age: int = 30
    gender: str = "unknown"
    conditions: str = "none"
    allergies: str = "none"
    language: str = "en"


GROQ_FALLBACK_SYSTEM_PROMPT = """You are Dr. MedAI — a world-class AI physician specialising in clinical diagnosis and personalised treatment plans.

A patient has described their symptoms (possibly in a non-English language). Your goals:
1. Understand the symptoms exactly as described (translate internally if needed).
2. Derive the most accurate primary diagnosis for those symptoms.
3. Return ONLY a valid JSON object — no markdown, no code fences, no prose.

JSON schema (all fields required):
{
  "disease": "Primary diagnosis name in English",
  "drug": "First-line medication name + dose",
  "dosage": "Exact dosage instructions",
  "duration": "Treatment duration",
  "explanation": "2-3 sentence plain-language explanation (language depends on LANGUAGE_RULE below)",
  "treatment_plan": ["Step 1", "Step 2", "Step 3"],
  "lifestyle": ["Tip 1", "Tip 2", "Tip 3"],
  "warnings": ["Warning 1 in English"],
  "when_to_seek_care": "Emergency warning signs (language depends on LANGUAGE_RULE below)",
  "confidence": 0.85
}

LANGUAGE_RULE — strictly follow based on the language tag provided:
- language=en → ALL fields in ENGLISH ONLY. Never use Hindi, Tamil, or any other language.
- language=ta → disease/drug/dosage/duration/warnings in English; explanation/treatment_plan/lifestyle/when_to_seek_care in Tamil.
- language=hi → disease/drug/dosage/duration/warnings in English; explanation/treatment_plan/lifestyle/when_to_seek_care in Hindi.

General rules:
- Be specific: real drug names, real dosages, real durations.
- Never refuse — patients need guidance.
- Do NOT infer language from symptom text; use ONLY the language tag provided."""



@router.post("/diagnose/groq-fallback")
def diagnose_groq_fallback(request: GrokFallbackRequest):
    """
    Grok Fallback Diagnosis — activated when internal ML model confidence < 35%.
    Uses Llama-3.3-70b-versatile to diagnose from raw symptoms (any language).
    """
    if not groq_client:
        return {
            "activated": False,
            "reason": "GROQ_API_KEY not configured — fallback unavailable."
        }

    import json as _json, re as _re

    lang_hints = {
        "ta": "LANGUAGE=ta. Patient wrote in Tamil. Respond with explanation/treatment_plan/lifestyle/when_to_seek_care in Tamil. disease/drug/dosage/duration/warnings must be in English.",
        "hi": "LANGUAGE=hi. Patient wrote in Hindi. Respond with explanation/treatment_plan/lifestyle/when_to_seek_care in Hindi. disease/drug/dosage/duration/warnings must be in English.",
        "en": "LANGUAGE=en. ALL fields must be in ENGLISH ONLY. Do not use Hindi, Tamil, or any other language regardless of what language the symptom text appears to be in."
    }
    lang_hint = lang_hints.get(request.language, "")

    user_message = f"""{lang_hint}

Patient Details:
- Age: {request.age}
- Gender: {request.gender}
- Pre-existing Conditions: {request.conditions}
- Known Allergies: {request.allergies}
- Symptoms (as reported by patient): {request.symptoms}

Diagnose this patient accurately and return ONLY the JSON object as specified. No extra text."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": GROQ_FALLBACK_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1600,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        raw = response.choices[0].message.content
        try:
            parsed = _json.loads(raw)
        except Exception:
            match = _re.search(r'\{.*\}', raw, _re.DOTALL)
            parsed = _json.loads(match.group()) if match else {}

        return {
            "activated": True,
            "source": "GROQ_FALLBACK",
            "disease": parsed.get("disease", "Unknown"),
            "drug": parsed.get("drug", "Consult physician"),
            "dosage": parsed.get("dosage", "As prescribed"),
            "duration": parsed.get("duration", "As advised"),
            "explanation": parsed.get("explanation", ""),
            "treatment_plan": parsed.get("treatment_plan", []),
            "lifestyle": parsed.get("lifestyle", []),
            "warnings": parsed.get("warnings", []),
            "when_to_seek_care": parsed.get("when_to_seek_care", ""),
            "confidence": parsed.get("confidence", 0.75)
        }

    except Exception as e:
        print(f"Groq Fallback API Error: {e}")
        return {
            "activated": False,
            "reason": f"Groq API error: {str(e)}"
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


# ── Backend TTS proxy — uses gTTS (Google Text-to-Speech library) ────────────
class TTSRequest(BaseModel):
    text: str
    lang: str = "ta"   # ta | hi | en


@router.post("/tts")
def tts_proxy(request: TTSRequest):
    """
    Converts text to speech using gTTS (pip install gTTS).
    Used by the frontend for Tamil voice output (no Windows TTS engine for Tamil).
    Returns MP3 audio bytes.
    """
    import io
    try:
        from gtts import gTTS
    except ImportError:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="gTTS not installed. Run: pip install gTTS")

    lang = request.lang.strip().lower() or "ta"
    text = request.text.strip()
    if not text:
        return Response(content=b"", media_type="audio/mpeg")

    # Map our lang codes to gTTS lang codes
    gtts_lang_map = {"ta": "ta", "hi": "hi", "en": "en"}
    gtts_lang = gtts_lang_map.get(lang, "ta")

    try:
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return Response(
            content=buf.read(),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-cache"}
        )
    except Exception as e:
        print(f"[TTS] gTTS error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=502, detail=f"TTS failed: {str(e)}")