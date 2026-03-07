import os
import joblib
from agents.symptom_extractor import SymptomExtractor


class PatientAgent:

    def __init__(self):

        # Get backend directory
        BASE_DIR = os.path.dirname(os.path.dirname(__file__))

        MODEL_PATH = os.path.join(BASE_DIR, "models", "disease_model.pkl")

        self.model = joblib.load("models/disease_model.pkl")

        self.extractor = SymptomExtractor()

    def analyze_patient(self, age, gender, symptoms, allergies, conditions):

        structured_symptoms = self.extractor.extract(symptoms)

        probs = self.model.predict_proba([symptoms])[0]
        classes = self.model.classes_

        disease_probs = sorted(
            [
                {"disease": cls, "probability": float(round(prob, 4))}
                for cls, prob in zip(classes, probs)
            ],
            key=lambda x: x["probability"],
            reverse=True
        )

        predicted_disease = disease_probs[0]["disease"]

        return {
            "age": age,
            "gender": gender,
            "symptoms": symptoms,
            "structured_symptoms": structured_symptoms,
            "allergies": allergies,
            "conditions": conditions,
            "predicted_disease": predicted_disease,
            "disease_probabilities": disease_probs[:5]   # Top-5 differential
        }