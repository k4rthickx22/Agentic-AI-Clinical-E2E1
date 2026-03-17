class SeverityAgent:

    def detect_severity(self, patient_profile):

        structured = patient_profile["structured_symptoms"]
        predicted_disease = patient_profile["predicted_disease"]
        probabilities = patient_profile["disease_probabilities"]
        age = patient_profile["age"]
        conditions = str(patient_profile.get("conditions", "")).lower()

        emergency_score = 0
        reasons = []

        # ----------------------------------
        # 1️⃣ Severe Symptom Logic
        # ----------------------------------
        if structured.get("severity") == "severe":
            emergency_score += 25
            reasons.append("Severe symptom intensity reported")

        if structured.get("chest_pain"):
            emergency_score += 25
            reasons.append("Chest pain detected")

        if structured.get("breathing_difficulty"):
            emergency_score += 30
            reasons.append("Breathing difficulty detected")

        if structured.get("bleeding"):
            emergency_score += 40
            reasons.append("Bleeding symptom detected")

        if structured.get("vomiting") and structured.get("severity") == "severe":
            emergency_score += 15
            reasons.append("Severe vomiting")

        # New symptom signals
        if structured.get("confusion"):
            emergency_score += 40
            reasons.append("⚠️ Confusion/altered consciousness detected — possible encephalopathy")

        if structured.get("rash"):
            emergency_score += 10
            reasons.append("Skin rash detected — possible viral or allergic etiology")

        if structured.get("joint_pain") and structured.get("fever"):
            emergency_score += 10
            reasons.append("Fever with joint pain — possible Dengue or Chikungunya")

        if structured.get("dizziness"):
            emergency_score += 10
            reasons.append("Dizziness reported — monitor for dehydration or cardiovascular cause")

        if structured.get("diarrhea") and structured.get("fever"):
            emergency_score += 10
            reasons.append("Fever with diarrhea — possible enteric/GI infection")

        if structured.get("abdominal_pain") and structured.get("vomiting"):
            emergency_score += 15
            reasons.append("Abdominal pain with vomiting — possible GI emergency")

        # ----------------------------------
        # 2️⃣ Duration Risk
        # ----------------------------------
        if structured.get("duration_days"):
            if structured["duration_days"] >= 5:
                emergency_score += 10
                reasons.append("Symptoms lasting more than 5 days")

        # ----------------------------------
        # 3️⃣ Disease Probability Risk
        # ----------------------------------
        top_prob = probabilities[0]["probability"]

        if top_prob > 0.80:
            emergency_score += 10
            reasons.append("High confidence disease prediction")

        # High risk diseases
        high_risk_diseases = [
            "Pneumonia",
            "Dengue Fever",
            "Asthma",
            "Sepsis"
        ]

        # Check top-5 diseases
        for disease_info in probabilities[:5]:
            disease = disease_info["disease"]

            if disease in high_risk_diseases:
                emergency_score += 10
                reasons.append(f"High-risk disease suspected: {disease}")

        # ----------------------------------
        # 4️⃣ Age Risk
        # ----------------------------------
        if age >= 65 or age <= 5:
            emergency_score += 15
            reasons.append("High-risk age group")

        # ----------------------------------
        # 5️⃣ Comorbidity Risk
        # ----------------------------------
        high_risk_conditions = [
            "diabetes",
            "hypertension",
            "heart disease",
            "kidney disease",
            "asthma",
            "copd"
        ]

        for condition in high_risk_conditions:
            if condition in conditions:
                emergency_score += 10
                reasons.append(f"Comorbidity detected: {condition}")

        # ----------------------------------
        # FINAL TRIAGE DECISION
        # ----------------------------------
        if emergency_score >= 60:
            return {
                "level": "HIGH",
                "recommendation": "🚨 Immediate hospital visit recommended.",
                "score": emergency_score,
                "reasons": reasons
            }

        elif emergency_score >= 35:
            return {
                "level": "MODERATE",
                "recommendation": "⚠ Doctor consultation advised within 24 hours.",
                "score": emergency_score,
                "reasons": reasons
            }

        else:
            return {
                "level": "LOW",
                "recommendation": "✅ Home care possible with monitoring.",
                "score": emergency_score,
                "reasons": reasons
            }