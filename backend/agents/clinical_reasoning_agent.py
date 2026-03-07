class ClinicalReasoningAgent:

    def refine_diagnosis(self, symptoms, predicted):

        symptoms = symptoms.lower()

        refined = []

        for item in predicted:

            disease = item["disease"]

            if disease == "Dengue Fever":
                if "rash" in symptoms or "body pain" in symptoms:
                    refined.append(item)

            elif disease == "Common Cold":
                if "sneezing" in symptoms or "runny nose" in symptoms:
                    refined.append(item)

            else:
                refined.append(item)

        return refined