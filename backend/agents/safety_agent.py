class SafetyAgent:

    def filter_diagnosis(self, profile, diagnosis):

        symptoms = profile["structured_symptoms"]
        disease = diagnosis["disease"]

        # Dengue Fever requires specific symptoms - downgrade to Normal Fever
        if disease == "Dengue Fever":
            if not (
                symptoms.get("rash")
                or symptoms.get("bleeding")
                or symptoms.get("joint_pain")
            ):
                diagnosis["disease"] = "Normal Fever"
                diagnosis["flag"] = "downgraded"

        # Viral Fever - if only fever is present with no other specific symptoms, call it Normal Fever
        elif disease == "Viral Fever":
            specific_symptoms = [
                symptoms.get("cough"), symptoms.get("sore_throat"),
                symptoms.get("runny_nose"), symptoms.get("vomiting"),
                symptoms.get("headache"), symptoms.get("fatigue")
            ]
            if not any(specific_symptoms):
                diagnosis["disease"] = "Normal Fever"
                diagnosis["flag"] = "simplified"

        return diagnosis