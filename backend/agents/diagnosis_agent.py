import joblib
import numpy as np

class DiagnosisAgent:

    def __init__(self):
        self.model = joblib.load("backend/models/disease_model.pkl")

    def predict_diseases(self, symptoms):

        probs = self.model.predict_proba([symptoms])[0]
        classes = self.model.classes_

        top_indices = np.argsort(probs)[::-1][:5]

        results = []

        for idx in top_indices:
            results.append({
                "disease": classes[idx],
                "probability": float(probs[idx])
            })

        return results