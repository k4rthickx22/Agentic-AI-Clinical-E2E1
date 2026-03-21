import os
import json
import csv


# Map ML model class names → treatment lookup keys
DISEASE_ALIASES = {
    "Normal Fever": "Normal Fever",
    "Viral Fever": "Viral Fever",
    "Common Cold": "Common Cold",
    "Dengue Fever": "Dengue Fever",
    "Dengue": "Dengue Fever",
    "Pneumonia": "Pneumonia",
    "Asthma": "Asthma",
    "Anemia": "Anemia",
    "Diabetes": "Diabetes",
    "Hypertension": "Hypertension",
    "Gastritis": "Gastritis",
    "Migraine": "Migraine",
    "Bacterial Infection": "Bacterial Infection",
}


class DecisionAgent:
    """
    Final treatment decision agent.
    Uses treatments.json (comprehensive) and drugs.csv (drug-level details)
    to build a complete, personalized treatment plan.
    """

    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.dirname(__file__))
        treatments_path = os.path.join(BASE_DIR, "data", "treatments.json")
        drugs_path = os.path.join(BASE_DIR, "data", "drugs.csv")

        # Load comprehensive treatment data
        try:
            with open(treatments_path) as f:
                self.treatments = json.load(f)
        except Exception:
            self.treatments = {}

        # Load drugs.csv as a lookup: disease -> list of drug records
        self.drugs_db: dict = {}
        try:
            with open(drugs_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    disease = row.get("disease", "").strip()
                    if disease not in self.drugs_db:
                        self.drugs_db[disease] = []
                    self.drugs_db[disease].append({
                        "drug_name": row.get("drug_name", "").strip(),
                        "dosage": row.get("dosage", "").strip(),
                        "min_age": int(row.get("min_age", 0) or 0),
                        "max_age": int(row.get("max_age", 99) or 99),
                        "allergy": row.get("allergy", "None").strip(),
                        "effectiveness_score": float(row.get("effectiveness_score", 7) or 7),
                    })
        except Exception as e:
            print(f"DecisionAgent: could not load drugs.csv — {e}")

    def _resolve_disease(self, disease: str) -> str:
        """Normalize disease name via alias map, case-insensitive fallback."""
        if disease in DISEASE_ALIASES:
            return DISEASE_ALIASES[disease]
        # Fuzzy: try case-insensitive match
        for key, value in DISEASE_ALIASES.items():
            if key.lower() == disease.lower():
                return value
        # Partial: e.g. "fever" → "Normal Fever"
        dl = disease.lower()
        if "dengue" in dl:
            return "Dengue Fever"
        if "fever" in dl or "viral" in dl:
            return "Viral Fever"
        if "cold" in dl:
            return "Common Cold"
        if "pneumonia" in dl:
            return "Pneumonia"
        if "asthma" in dl:
            return "Asthma"
        if "anemia" in dl or "anaemia" in dl:
            return "Anemia"
        if "diabetes" in dl or "diabetic" in dl:
            return "Diabetes"
        if "hypertension" in dl or "blood pressure" in dl:
            return "Hypertension"
        if "gastritis" in dl or "gastric" in dl:
            return "Gastritis"
        if "migraine" in dl:
            return "Migraine"
        if "bacterial" in dl or "infection" in dl:
            return "Bacterial Infection"
        return disease  # return as-is, may fall through to generic

    def _pick_best_drug_from_csv(self, disease: str, patient_age: int, patient_allergies: str) -> dict | None:
        """Pick the best matching drug for this patient from drugs.csv."""
        candidates = self.drugs_db.get(disease, [])
        if not candidates:
            return None

        allergies_lower = str(patient_allergies).lower()

        # Filter by age range and allergy safety
        safe = [
            d for d in candidates
            if d["min_age"] <= patient_age <= d["max_age"]
            and (d["allergy"] == "None" or d["allergy"].lower() not in allergies_lower)
        ]

        if not safe:
            safe = candidates  # if all filtered, use all

        # Sort by effectiveness descending
        safe.sort(key=lambda x: x["effectiveness_score"], reverse=True)
        return safe[0] if safe else None

    def make_decision(self, profile: dict, ranked_drugs: list) -> dict:
        """
        Select the best treatment plan from ranked_drugs with fallback to treatments.json.
        """
        predicted_disease = profile.get("predicted_disease", "Unknown")
        resolved = self._resolve_disease(predicted_disease)
        age = int(profile.get("age", 30) or 30)
        allergies = str(profile.get("allergies", ""))

        # Fetch full treatment from JSON
        treatment_data = self.treatments.get(resolved, self.treatments.get(predicted_disease, {}))

        # Fetch best drug from CSV for this patient
        csv_drug = self._pick_best_drug_from_csv(resolved, age, allergies)

        # Prefer CSV drug name if available, fallback to JSON
        recommended_drug = (
            csv_drug["drug_name"] if csv_drug
            else treatment_data.get("drug", "Consult a physician")
        )

        # Build the complete dosage string
        if csv_drug and csv_drug.get("dosage"):
            dosage = f"{csv_drug['drug_name']} {csv_drug['dosage']}"
            if treatment_data.get("dosage"):
                dosage = treatment_data["dosage"]  # prefer rich text dosage
        else:
            dosage = treatment_data.get("dosage", "As prescribed by your doctor")

        duration = treatment_data.get("duration", "Until symptoms resolve — follow up with your doctor")
        lifestyle = treatment_data.get("lifestyle", [])
        explanation = treatment_data.get("explanation", f"Treatment plan for {resolved} based on clinical guidelines.")
        when_to_seek_care = treatment_data.get("when_to_seek_care", "Consult a doctor if symptoms worsen or do not improve within 3 days.")

        # Build warnings
        warnings = self._build_warnings(profile, recommended_drug, resolved)

        # Build step-by-step plan
        treatment_plan = self._build_treatment_plan(resolved, recommended_drug, dosage, duration)

        return {
            "predicted_disease": resolved,
            "recommended_drug": treatment_data.get("drug", recommended_drug),
            "dosage": dosage,
            "duration": duration,
            "lifestyle": lifestyle if isinstance(lifestyle, list) else [],
            "explanation": explanation,
            "when_to_seek_care": when_to_seek_care,
            "warnings": warnings,
            "treatment_plan": treatment_plan,
        }

    def _build_warnings(self, profile: dict, drug: str, disease: str) -> list:
        warnings = []
        allergies = str(profile.get("allergies", "none")).lower()

        if allergies not in ("none", "", "no allergies", "nil", "n/a"):
            warnings.append(
                f"⚠️ Patient has reported allergies to: {profile.get('allergies')}. "
                f"Verify {drug} is safe before use."
            )

        conditions = str(profile.get("conditions", "none")).lower()
        if conditions not in ("none", "", "no conditions", "nil", "n/a"):
            warnings.append(
                f"⚠️ Pre-existing condition: {profile.get('conditions')}. "
                "Monitor closely during treatment and inform your doctor."
            )

        age = int(profile.get("age", 30) or 30)
        if age < 12:
            warnings.append("⚠️ Pediatric patient: Dosage must be adjusted per body weight. Confirm with a pediatrician before use.")
        elif age > 65:
            warnings.append("⚠️ Elderly patient: Start at lower dosage and monitor for adverse effects, especially kidney and liver function.")

        # Disease-specific warnings
        if "dengue" in disease.lower():
            warnings.append("🚨 CRITICAL: Do NOT take Ibuprofen, Aspirin, or any NSAID — they increase bleeding risk in Dengue.")
        if "diabetes" in disease.lower():
            warnings.append("⚠️ Monitor blood sugar levels daily. Never skip doses or meals without medical advice.")
        if "hypertension" in disease.lower():
            warnings.append("⚠️ Do not stop antihypertensive medication abruptly — this can cause a hypertensive crisis.")

        return warnings if warnings else ["✅ No specific allergy or safety concerns detected. Follow dosage instructions carefully."]

    def _build_treatment_plan(self, disease: str, drug: str, dosage: str, duration: str) -> list:
        return [
            f"1️⃣ Confirm diagnosis of {disease} — consult a doctor for verification if needed.",
            f"2️⃣ Start {drug} at the prescribed dosage: {dosage}.",
            f"3️⃣ Continue treatment for: {duration}.",
            "4️⃣ Track symptoms daily — note any changes or new symptoms.",
            "5️⃣ Follow all lifestyle recommendations for faster recovery.",
            "6️⃣ Follow up with your doctor if symptoms persist or worsen.",
        ]
