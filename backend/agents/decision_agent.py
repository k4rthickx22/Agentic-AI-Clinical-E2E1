import os
import json


class DecisionAgent:
    """
    Final treatment decision agent.
    Picks the best treatment from ranked_drugs (output of RiskAgent)
    and enriches it with dosage, duration, lifestyle, and warning info
    from the treatments dataset.
    """

    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.dirname(__file__))
        DATA_PATH = os.path.join(BASE_DIR, "data", "treatments.json")
        try:
            with open(DATA_PATH) as f:
                self.treatments = json.load(f)
        except Exception:
            self.treatments = {}

    def make_decision(self, profile: dict, ranked_drugs: list) -> dict:
        """
        Select the best treatment plan from ranked_drugs.
        Falls back to the predicted_disease from profile if ranked_drugs is empty.
        """
        predicted_disease = profile.get("predicted_disease", "Unknown")

        # If RiskAgent returned a ranked list, pick the first
        if ranked_drugs and isinstance(ranked_drugs, list) and len(ranked_drugs) > 0:
            best = ranked_drugs[0]
            disease = best.get("disease", predicted_disease)
        else:
            disease = predicted_disease
            best = {}

        # Look up full treatment details from dataset
        treatment_data = self.treatments.get(disease, {})

        # Build comprehensive treatment plan
        recommended_drug = (
            best.get("recommended_drug")
            or treatment_data.get("drug")
            or "Consult a physician"
        )

        dosage = (
            best.get("dosage")
            or treatment_data.get("dosage")
            or "As prescribed by your doctor"
        )

        duration = (
            best.get("duration")
            or treatment_data.get("duration")
            or "Until symptoms resolve"
        )

        lifestyle = (
            best.get("lifestyle")
            or treatment_data.get("lifestyle")
            or []
        )

        explanation = (
            best.get("explanation")
            or treatment_data.get("explanation")
            or f"Treatment plan for {disease} based on clinical guidelines."
        )

        # Build warnings from allergy + safety context
        warnings = self._build_warnings(profile, recommended_drug, disease)

        return {
            "predicted_disease": disease,
            "recommended_drug": recommended_drug,
            "dosage": dosage,
            "duration": duration,
            "lifestyle": lifestyle if isinstance(lifestyle, list) else [],
            "explanation": explanation,
            "warnings": warnings,
            "treatment_plan": self._build_treatment_plan(disease, recommended_drug, dosage, duration),
        }

    def _build_warnings(self, profile: dict, drug: str, disease: str) -> list:
        warnings = []
        allergies = str(profile.get("allergies", "none")).lower()

        if allergies not in ("none", "", "no allergies"):
            warnings.append(
                f"Patient has reported allergies to: {profile.get('allergies')}. "
                f"Verify {drug} is safe before prescribing."
            )

        conditions = str(profile.get("conditions", "none")).lower()
        if conditions not in ("none", "", "no conditions"):
            warnings.append(
                f"Pre-existing condition: {profile.get('conditions')}. "
                "Monitor closely during treatment."
            )

        age = profile.get("age", 30)
        if age < 12:
            warnings.append("Pediatric patient: adjust dosage per body weight. Confirm with pediatrician.")
        elif age > 65:
            warnings.append("Elderly patient: consider reduced dosage and monitor for adverse effects.")

        return warnings

    def _build_treatment_plan(self, disease: str, drug: str, dosage: str, duration: str) -> list:
        """Build a step-by-step treatment plan."""
        return [
            f"Step 1: Confirm diagnosis of {disease} with relevant tests if needed.",
            f"Step 2: Begin {drug} at {dosage}.",
            f"Step 3: Continue treatment for {duration}.",
            "Step 4: Monitor symptoms daily and note any side effects.",
            "Step 5: Follow up with your doctor if symptoms worsen or persist.",
        ]
