import os
from dotenv import load_dotenv
from agents.clinical_protocol import clinical_protocols

try:
    from openai import OpenAI
    HAS_LLM_DEPS = True
except ImportError:
    HAS_LLM_DEPS = False

load_dotenv()

class DecisionAgent:

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if HAS_LLM_DEPS and self.api_key else None

    def make_decision(self, patient_profile, ranked_drugs):
        predicted_disease = patient_profile["predicted_disease"]
        decision = None

        # -----------------------------
        # Clinical Protocol Override
        # -----------------------------
        protocol = clinical_protocols.get(predicted_disease)
        if protocol:
            decision = {
                "predicted_disease": predicted_disease,
                "recommended_drug": protocol["first_line"],
                "dosage": protocol["dosage"],
                "duration": protocol["duration"],
                "explanation": protocol["explanation"],
                "lifestyle": protocol.get("lifestyle", []),
                "warnings": protocol.get("warnings", []),
                "risk_score": "Clinically Optimized"
            }
        elif not ranked_drugs:
            decision = {
                "predicted_disease": predicted_disease,
                "recommended_drug": "No drug available",
                "explanation": "No suitable drug found.",
                "dosage": "N/A",
                "duration": "N/A",
                "lifestyle": [],
                "warnings": [],
                "risk_score": "Unknown"
            }
        else:
            best_drug = ranked_drugs[0]
            decision = {
                "predicted_disease": predicted_disease,
                "recommended_drug": best_drug.get("recommended_drug", "Consult doctor"),
                "risk_score": best_drug.get("risk_score", "Unknown"),
                "explanation": "Drug selected with lowest calculated risk score.",
                "dosage": best_drug.get("dosage", "Refer prescription"),
                "duration": best_drug.get("duration", "As advised"),
                "lifestyle": best_drug.get("lifestyle", []),
                "warnings": []
            }

        # -----------------------------
        # AI Explanation Generation
        # -----------------------------
        if self.client and self.api_key:
            decision["explanation"] = self._generate_bedside_manner(patient_profile, decision)

        return decision

    def _generate_bedside_manner(self, profile, decision):
        try:
            prompt = (
                "You are an empathetic, professional clinical AI doctor prescribing treatment. "
                "Write a short, comforting 2-sentence explanation to the patient about why they are taking this drug."
            )
            context = f"Patient Age: {profile['age']}\nDisease: {decision['predicted_disease']}\nDrug: {decision['recommended_drug']}\nDosage: {decision['dosage']}"
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": context}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Explanation failed: {e}")
            return decision["explanation"]