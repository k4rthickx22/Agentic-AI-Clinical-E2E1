import re


class SymptomExtractor:

    def extract(self, symptoms_text):

        text = symptoms_text.lower()

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

        # Symptom Detection
        if "fever" in text:
            structured["fever"] = True

        if "cough" in text:
            structured["cough"] = True

        if "chest pain" in text:
            structured["chest_pain"] = True

        if "breath" in text or "dyspnea" in text:
            structured["breathing_difficulty"] = True

        if "fatigue" in text or "weakness" in text:
            structured["fatigue"] = True

        if "headache" in text:
            structured["headache"] = True

        if "sore throat" in text:
            structured["sore_throat"] = True

        if "runny nose" in text or "nasal congestion" in text:
            structured["runny_nose"] = True

        if "vomiting" in text:
            structured["vomiting"] = True

        if "bleeding" in text:
            structured["bleeding"] = True

        # Duration Extraction (e.g., "for 3 days")
        match = re.search(r"(\d+)\s*day", text)
        if match:
            structured["duration_days"] = int(match.group(1))

        # Severity Detection
        if "severe" in text:
            structured["severity"] = "severe"
        elif "moderate" in text:
            structured["severity"] = "moderate"
        elif "mild" in text:
            structured["severity"] = "mild"

        return structured