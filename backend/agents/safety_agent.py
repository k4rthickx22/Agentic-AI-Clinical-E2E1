class SafetyAgent:

    def filter_diagnosis(self, profile, diagnosis):

        symptoms = profile["structured_symptoms"]

        # Dengue requires more specific symptoms
        if diagnosis["disease"] == "Dengue":

            if not (
                symptoms.get("rash")
                or symptoms.get("bleeding")
                or symptoms.get("joint_pain")
            ):
                diagnosis["disease"] = "Viral Fever"
                diagnosis["flag"] = "downgraded"

        return diagnosis