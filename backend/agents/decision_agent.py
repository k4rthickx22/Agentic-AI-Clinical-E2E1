from agents.clinical_protocol import clinical_protocols


class DecisionAgent:

    def make_decision(self, patient_profile, ranked_drugs):

        predicted_disease = patient_profile["predicted_disease"]

        # -----------------------------
        # Clinical Protocol Override
        # -----------------------------
        protocol = clinical_protocols.get(predicted_disease)

        if protocol:
            return {
                "predicted_disease": predicted_disease,
                "recommended_drug": protocol["first_line"],
                "dosage": protocol["dosage"],
                "duration": protocol["duration"],
                "explanation": protocol["explanation"],
                "lifestyle": protocol.get("lifestyle", []),
                "warnings": protocol.get("warnings", []),
                "risk_score": "Clinically Optimized"
            }

        # -----------------------------
        # If no drugs available
        # -----------------------------
        if not ranked_drugs:
            return {
                "predicted_disease": predicted_disease,
                "recommended_drug": "No drug available",
                "explanation": "No suitable drug found.",
                "dosage": "N/A",
                "duration": "N/A",
                "lifestyle": [],
                "warnings": [],
                "risk_score": "Unknown"
            }

        # -----------------------------
        # Choose safest ranked drug
        # -----------------------------
        best_drug = ranked_drugs[0]

        return {
            "predicted_disease": predicted_disease,
            "recommended_drug": best_drug.get("recommended_drug", "Consult doctor"),
            "risk_score": best_drug.get("risk_score", "Unknown"),
            "explanation": "Drug selected with lowest calculated risk score.",
            "dosage": best_drug.get("dosage", "Refer prescription"),
            "duration": best_drug.get("duration", "As advised"),
            "lifestyle": best_drug.get("lifestyle", []),
            "warnings": []
        }