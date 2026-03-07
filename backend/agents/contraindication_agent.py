class ContraindicationAgent:

    def evaluate(self, patient_profile, final_decision, triage):

        age = patient_profile["age"]
        conditions = str(patient_profile["conditions"]).lower()
        structured = patient_profile["structured_symptoms"]
        drug = final_decision["recommended_drug"]
        disease = final_decision["predicted_disease"]

        risk_score = 0
        warnings = []
        adjusted_drug = drug

        # -----------------------------
        # 1️⃣ Age-Based Risk
        # -----------------------------
        if age >= 65:
            risk_score += 15
            warnings.append("Elderly patient — monitor drug tolerance closely.")

        if age <= 5:
            risk_score += 20
            warnings.append("Pediatric patient — dosage adjustment required.")

        # -----------------------------
        # 2️⃣ Comorbidity-Based Risk
        # -----------------------------
        if "kidney" in conditions:
            risk_score += 25
            warnings.append("Kidney condition detected — dosage adjustment required.")

        if "liver" in conditions:
            risk_score += 20
            warnings.append("Liver condition detected — caution with metabolism-dependent drugs.")

        if "heart" in conditions:
            risk_score += 20
            warnings.append("Cardiac history detected — monitor closely.")

        if "hypertension" in conditions and "salbutamol" in drug.lower():
            risk_score += 15
            warnings.append("Salbutamol may increase heart rate in hypertensive patients.")

        # -----------------------------
        # 3️⃣ Severe Symptom Override
        # -----------------------------
        if structured["severity"] == "severe":
            risk_score += 15
            warnings.append("Severe symptom presentation — outpatient medication may be insufficient.")

        # -----------------------------
        # 4️⃣ Emergency Override
        # -----------------------------
        if triage["level"] == "HIGH":
            warnings.append("Emergency case — prioritize hospital treatment over medication.")
            adjusted_drug = "Hospital-based management required"
            risk_score += 40

        # -----------------------------
        # 5️⃣ Risk Categorization
        # -----------------------------
        if risk_score >= 60:
            safety_level = "UNSAFE"
        elif risk_score >= 30:
            safety_level = "CAUTION"
        else:
            safety_level = "SAFE"

        return {
            "safety_level": safety_level,
            "risk_score": risk_score,
            "clinical_warnings": warnings,
            "final_recommendation": adjusted_drug
        }