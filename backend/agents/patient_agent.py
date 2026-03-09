import os
import joblib
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
from agents.symptom_extractor import SymptomExtractor

try:
    from openai import OpenAI
    HAS_LLM_DEPS = True
except ImportError:
    HAS_LLM_DEPS = False

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if HAS_LLM_DEPS and os.getenv("OPENAI_API_KEY") else None

class DiseaseProbability(BaseModel):
    disease: str = Field(description="The formal Medical name of the disease")
    probability: float = Field(description="The probability (0.0 to 1.0) of this diagnosis")

class DifferentialSchema(BaseModel):
    predicted_disease: str = Field(description="The single most likely primary diagnosis")
    disease_probabilities: List[DiseaseProbability] = Field(description="Top 5 differential diagnoses with their confidence probabilities")

class PatientAgent:

    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.dirname(__file__))
        self.model = joblib.load(os.path.join(BASE_DIR, "models", "disease_model.pkl"))
        self.extractor = SymptomExtractor()

    def analyze_patient(self, age, gender, symptoms, allergies, conditions):
        structured_symptoms = self.extractor.extract(symptoms)

        if client:
            try:
                return self._analyze_with_llm(age, gender, symptoms, allergies, conditions, structured_symptoms)
            except Exception as e:
                print(f"PatientAgent LLM error: {e}")
                return self._analyze_rule_based(age, gender, symptoms, allergies, conditions, structured_symptoms)
        
        return self._analyze_rule_based(age, gender, symptoms, allergies, conditions, structured_symptoms)

    def _analyze_with_llm(self, age, gender, symptoms, allergies, conditions, structured_symptoms):
        prompt = f"""
You are an expert Clinical Diagnostician. 
Evaluate the following patient profile and symptoms to derive a highly accurate Differential Diagnosis list.

Patient Profile:
- Age: {age}
- Gender: {gender}
- Pre-existing Conditions: {conditions}
- Allergies: {allergies}
- Reported Symptoms: {symptoms}
- Extracted Symptoms: {structured_symptoms}

Instructions:
1. Act like a personalized, highly accurate medical doctor. 
2. If the user just provides vague symptoms like 'fever' or 'high fever', do NOT predict 'Dengue Fever' or rare diseases as the primary diagnosis. Instead, assign the highest probability to 'Viral Fever' (>70%) and keep 'Dengue Fever' very low (<5%) to avoid panicking the patient, unless specific warning signs (e.g., rash, bleeding, joint pain) are explicitly mentioned.
3. If specific dangerous symptoms are provided (e.g., 'fever with retro orbital pain and petechiae'), shift the heavy confidence towards the precise disease (e.g., Dengue Fever).
4. Return the exact predicted_disease and a list of 5 disease_probabilities.
"""

        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            response_format=DifferentialSchema
        )

        parsed = response.choices[0].message.parsed
        disease_probs = [{"disease": d.disease, "probability": d.probability} for d in parsed.disease_probabilities]

        # Ensure sorted
        disease_probs = sorted(disease_probs, key=lambda x: x["probability"], reverse=True)

        return {
            "age": age,
            "gender": gender,
            "symptoms": symptoms,
            "structured_symptoms": structured_symptoms,
            "allergies": allergies,
            "conditions": conditions,
            "predicted_disease": parsed.predicted_disease,
            "disease_probabilities": disease_probs[:5]
        }

    def _analyze_rule_based(self, age, gender, symptoms, allergies, conditions, structured_symptoms):
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