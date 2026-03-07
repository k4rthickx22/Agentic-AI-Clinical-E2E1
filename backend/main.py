from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home API
@app.get("/")
def home():
    return {"message": "Drug AI Agent Backend Running"}

# Request schema
class PatientData(BaseModel):
    age: int
    gender: str
    symptoms: list[str]
    conditions: list[str]

# Diagnose API
@app.post("/diagnose")
def diagnose(data: PatientData):

    # simple demo logic
    if "fever" in data.symptoms:
        disease = "Viral Fever"
        drug = "Paracetamol"
        triage_level = "LOW"
        risk_score = 20
    else:
        disease = "General Checkup Needed"
        drug = "Consult Physician"
        triage_level = "LOW"
        risk_score = 5

    return {
        "treatment": {
            "predicted_disease": disease,
            "recommended_drug": drug,
            "dosage": "500mg twice daily",
            "duration": "3-5 days",
            "warnings": [],
            "lifestyle": [
                "Drink plenty of fluids",
                "Take adequate rest",
                "Avoid cold foods"
            ]
        },
        "triage": {
            "level": triage_level,
            "score": risk_score,
            "recommendation": "Monitor symptoms and rest"
        },
        "drug_safety": {
            "safety_level": "SAFE",
            "risk_score": risk_score,
            "clinical_warnings": []
        },
        "patient_profile": {
            "disease_probabilities": [
                {"disease": disease, "probability": 0.75},
                {"disease": "Flu", "probability": 0.15},
                {"disease": "Dengue", "probability": 0.10}
            ]
        }
    }