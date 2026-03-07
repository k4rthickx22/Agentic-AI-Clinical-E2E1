from database.db import SessionLocal
from database.models import Consultation


def save_consultation(patient_data, result):

    db = SessionLocal()

    try:

        consultation = Consultation(
            age=patient_data["age"],
            gender=patient_data["gender"],
            symptoms=patient_data["symptoms"],
            predicted_disease=result["treatment"]["predicted_disease"],
            treatment=result["treatment"],
            triage=result["triage"],
            drug_safety=result["drug_safety"]
        )

        db.add(consultation)
        db.commit()

    finally:
        db.close()