class RiskAgent:

    def calculate_risk(self, patient_profile, drugs):

        # If drugs are already structured treatment plans
        # skip risk calculation
        if isinstance(drugs, dict):
            return []

        if not isinstance(drugs, list):
            return []

        ranked = []

        for drug in drugs:

            if not isinstance(drug, dict):
                continue

            # Age filtering
            if "min_age" in drug and "max_age" in drug:

                if not (drug["min_age"] <= patient_profile["age"] <= drug["max_age"]):
                    continue

            ranked.append(drug)

        # sort by risk score if available
        ranked.sort(key=lambda x: x.get("risk_score", 0))

        return ranked