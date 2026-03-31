import os
import re
from typing import Optional
from dotenv import load_dotenv

# Try importing OpenAI and Pydantic
try:
    from openai import OpenAI
    from pydantic import BaseModel
    HAS_LLM_DEPS = True
except ImportError:
    HAS_LLM_DEPS = False

load_dotenv()

if HAS_LLM_DEPS:
    class SymptomSchema(BaseModel):
        fever: bool
        cough: bool
        chest_pain: bool
        breathing_difficulty: bool
        fatigue: bool
        headache: bool
        sore_throat: bool
        runny_nose: bool
        vomiting: bool
        bleeding: bool
        # New clinical symptoms
        abdominal_pain: bool
        dizziness: bool
        diarrhea: bool
        rash: bool
        joint_pain: bool
        nausea: bool
        loss_of_appetite: bool
        confusion: bool
        back_pain: bool
        swelling: bool
        duration_days: Optional[int]
        severity: str  # "mild", "moderate", "severe", "unknown"


class SymptomExtractor:

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if HAS_LLM_DEPS and self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def extract(self, symptoms_text):
        if self.client and self.api_key:
            try:
                return self._extract_llm(symptoms_text)
            except Exception as e:
                print(f"LLM Extraction failed: {e}. Falling back to rule-based.")
                return self._extract_rule_based(symptoms_text)
        else:
            return self._extract_rule_based(symptoms_text)

    def _extract_llm(self, text):
        response = self.client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a clinical AI agent. Extract patient symptoms into structured data. If severity is not stated, use 'unknown'."},
                {"role": "user", "content": text}
            ],
            response_format=SymptomSchema,
        )
        return response.choices[0].message.parsed.model_dump()

    def _extract_rule_based(self, symbols_text):
        text = symbols_text.lower()
        structured: dict[str, bool | str | int | None] = {
            "fever": False,
            "cough": False,
            "chest_pain": False,
            "breathing_difficulty": False,
            "fatigue": False,
            "headache": False,
            "sore_throat": False,
            "runny_nose": False,
            "vomiting": False,
            "bleeding": False,
            # New symptoms
            "abdominal_pain": False,
            "dizziness": False,
            "diarrhea": False,
            "rash": False,
            "joint_pain": False,
            "nausea": False,
            "loss_of_appetite": False,
            "confusion": False,
            "back_pain": False,
            "swelling": False,
            "duration_days": None,
            "severity": "unknown"
        }

        if "fever" in text: structured["fever"] = True
        if "cough" in text: structured["cough"] = True
        if "chest pain" in text: structured["chest_pain"] = True
        if "breath" in text or "dyspnea" in text: structured["breathing_difficulty"] = True
        if "fatigue" in text or "weakness" in text: structured["fatigue"] = True
        if "headache" in text: structured["headache"] = True
        if "sore throat" in text: structured["sore_throat"] = True
        if "runny nose" in text or "nasal congestion" in text: structured["runny_nose"] = True
        if "vomiting" in text: structured["vomiting"] = True
        if "bleeding" in text or "blood" in text: structured["bleeding"] = True
        # New symptom extraction
        if "abdomen" in text or "abdominal" in text or "stomach ache" in text or "belly pain" in text: structured["abdominal_pain"] = True
        if "dizzy" in text or "dizziness" in text or "vertigo" in text: structured["dizziness"] = True
        if "diarrhea" in text or "diarrhoea" in text or "loose stools" in text or "loose motion" in text: structured["diarrhea"] = True
        if "rash" in text or "skin rash" in text or "spots" in text or "petechiae" in text: structured["rash"] = True
        if "joint pain" in text or "joint ache" in text or "arthralgia" in text or "bone pain" in text: structured["joint_pain"] = True
        if "nausea" in text or "nauseated" in text or "feel sick" in text: structured["nausea"] = True
        if "no appetite" in text or "loss of appetite" in text or "not eating" in text or "anorexia" in text: structured["loss_of_appetite"] = True
        if "confused" in text or "confusion" in text or "disoriented" in text or "altered" in text: structured["confusion"] = True
        if "back pain" in text or "lower back" in text or "backache" in text or "lumbar" in text: structured["back_pain"] = True
        if "swelling" in text or "swollen" in text or "edema" in text or "oedema" in text: structured["swelling"] = True

        match = re.search(r"(\d+)\s*day", text)
        if match: structured["duration_days"] = int(match.group(1))

        if "severe" in text: structured["severity"] = "severe"
        elif "moderate" in text: structured["severity"] = "moderate"
        elif "mild" in text: structured["severity"] = "mild"

        return structured