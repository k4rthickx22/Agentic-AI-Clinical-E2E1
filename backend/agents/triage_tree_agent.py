class TriageTreeAgent:

    def screen_diseases(self, profile, disease_probs):

        symptoms = profile["structured_symptoms"]

        filtered = []

        for disease in disease_probs:

            name = disease["disease"]

            # -------------------------
            # Dengue screening
            # -------------------------
            if name == "Dengue Fever":

                if not (
                    symptoms.get("rash")
                    or symptoms.get("joint_pain")
                    or symptoms.get("bleeding")
                ):
                    continue

            # -------------------------
            # Pneumonia screening
            # -------------------------
            if name == "Pneumonia":

                if not (
                    symptoms.get("cough")
                    and (
                        symptoms.get("breathing_difficulty")
                        or symptoms.get("chest_pain")
                    )
                ):
                    continue

            # -------------------------
            # Malaria screening
            # -------------------------
            if name == "Malaria":

                if not symptoms.get("fever"):
                    continue

            filtered.append(disease)

        # If filtering removed everything, return original
        if not filtered:
            return disease_probs

        return filtered