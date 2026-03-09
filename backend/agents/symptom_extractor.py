import os
import re
from typing import Optional
from dotenv import load_dotenv

# Try importing OpenAI and Pydantic
try:
    from openai import OpenAI
    from pydantic import BaseModel
    import pydantic
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
        duration_days: Optional[int]
        severity: str # "mild", "moderate", "severe", "unknown"


class SymptomExtractor:

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if HAS_LLM_DEPS and self.api_key else None

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
        structured = {
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
        if "bleeding" in text: structured["bleeding"] = True

        match = re.search(r"(\d+)\s*day", text)
        if match: structured["duration_days"] = int(match.group(1))

        if "severe" in text: structured["severity"] = "severe"
        elif "moderate" in text: structured["severity"] = "moderate"
        elif "mild" in text: structured["severity"] = "mild"

        return structured