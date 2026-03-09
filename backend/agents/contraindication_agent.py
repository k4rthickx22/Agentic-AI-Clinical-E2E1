import os
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

try:
    from openai import OpenAI
    HAS_LLM_DEPS = True
except ImportError:
    HAS_LLM_DEPS = False

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if HAS_LLM_DEPS and os.getenv("OPENAI_API_KEY") else None

class SafetySchema(BaseModel):
    safety_level: str = Field(description="Strictly one of: 'SAFE', 'CAUTION', or 'UNSAFE'")
    risk_score: int = Field(description="Risk score from 0 to 100, where 100 is life-threatening")
    clinical_warnings: List[str] = Field(description="List of specific clinical warnings, allergy contraindications, or dosage adjustments")
    final_recommendation: str = Field(description="The final adjusted drug recommendation or an emergency hospital referral")


class ContraindicationAgent:

    def evaluate(self, patient_profile, final_decision, triage):
        if client:
            try:
                return self._evaluate_with_llm(patient_profile, final_decision, triage)
            except Exception as e:
                print(f"SafetyAgent LLM error: {e}")
                return self._evaluate_rule_based(patient_profile, final_decision, triage)
                
        return self._evaluate_rule_based(patient_profile, final_decision, triage)

    def _evaluate_with_llm(self, patient_profile, final_decision, triage):
        prompt = f"""
You are a strict Clinical Safety Agent checking for AI hallucinations and drug contraindications.
You are reviewing a proposed treatment plan.

Patient Profile:
- Age: {patient_profile["age"]}
- Gender: {patient_profile["gender"]}
- Symptoms: {patient_profile["symptoms"]}
- Pre-existing Conditions: {patient_profile["conditions"]}
- Allergies: {patient_profile["allergies"]}

Proposed Treatment:
- Predicted Disease: {final_decision["predicted_disease"]}
- Recommended Drug: {final_decision["recommended_drug"]}
- Dosage: {final_decision["dosage"]}

Triage Level: {triage["level"]}

Instructions:
1. Check if the "Recommended Drug" is safe given the patient's "Conditions" and "Allergies".
2. If there's an allergy to the drug or a severe contraindication, output safety_level "UNSAFE", risk_score 80-100, and change final_recommendation to an alternative drug or "Hospital-based management required".
3. If it's safe but requires caution, output "CAUTION" and provide specific clinical_warnings.
4. Explain any specific warnings simply and professionally.
"""

        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            response_format=SafetySchema
        )

        parsed = response.choices[0].message.parsed
        return parsed.model_dump()

    def _evaluate_rule_based(self, patient_profile, final_decision, triage):
        age = patient_profile["age"]
        conditions = str(patient_profile["conditions"]).lower()
        allergies = str(patient_profile.get("allergies", "")).lower()
        structured = patient_profile["structured_symptoms"]
        drug = final_decision["recommended_drug"]

        risk_score = 0
        warnings = []
        adjusted_drug = drug

        # Allergies
        if drug.lower() in allergies:
            risk_score += 80
            warnings.append(f"SEVERE ALLERGY WARNING: Patient is allergic to {drug}.")
            adjusted_drug = "Alternative medication required"

        if age >= 65:
            risk_score += 15
            warnings.append("Elderly patient — monitor drug tolerance closely.")
        if age <= 5:
            risk_score += 20
            warnings.append("Pediatric patient — dosage adjustment required.")

        if "kidney" in conditions:
            risk_score += 25
            warnings.append("Kidney condition detected — dosage adjustment required.")
        if "liver" in conditions:
            risk_score += 20
            warnings.append("Liver condition detected — caution with metabolism-dependent drugs.")
        if "heart" in conditions:
            risk_score += 20
            warnings.append("Cardiac history detected — monitor closely.")

        if type(structured) == dict and structured.get("severity") == "severe":
            risk_score += 15
            warnings.append("Severe symptom presentation — outpatient medication may be insufficient.")

        if triage["level"] == "HIGH":
            warnings.append("Emergency case — prioritize hospital treatment over medication.")
            adjusted_drug = "Hospital-based management required"
            risk_score += 40

        if risk_score >= 60:
            safety_level = "UNSAFE"
        elif risk_score >= 30:
            safety_level = "CAUTION"
        else:
            safety_level = "SAFE"

        return {
            "safety_level": safety_level,
            "risk_score": min(risk_score, 100),
            "clinical_warnings": warnings,
            "final_recommendation": adjusted_drug
        }