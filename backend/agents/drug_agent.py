import os
import json


class DrugAgent:

    def __init__(self):

        BASE_DIR = os.path.dirname(os.path.dirname(__file__))

        DATA_PATH = os.path.join(BASE_DIR, "data", "treatments.json")

        with open("data/treatments.json") as f:
            self.treatments = json.load(f)

    def get_drugs_for_disease(self, disease):

        if disease in self.treatments:

            treatment = self.treatments[disease]

            return {
                "disease": disease,
                "recommended_drug": treatment["drug"],
                "dosage": treatment["dosage"],
                "duration": treatment["duration"],
                "explanation": treatment["explanation"],
                "lifestyle": treatment["lifestyle"]
            }

        return {
            "disease": disease,
            "recommended_drug": "Consult physician",
            "dosage": "N/A",
            "duration": "N/A",
            "explanation": "No treatment guideline available.",
            "lifestyle": []
        }

    # ----------------------------------
    # Drug recommendations for Top-5
    # ----------------------------------

    def get_drugs_for_differential(self, disease_predictions):

        recommendations = []

        for item in disease_predictions[:5]:

            disease = item["disease"]
            probability = item["probability"]

            treatment = self.get_drugs_for_disease(disease)

            treatment["probability"] = probability

            recommendations.append(treatment)

        return recommendations