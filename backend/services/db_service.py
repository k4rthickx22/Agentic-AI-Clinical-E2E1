from database.db import SessionLocal
from database.models import Consultation
from sqlalchemy import desc, func

def save_consultation(patient_data, result):
    db = SessionLocal()
    try:
        consultation = Consultation(
            user_id=patient_data.get("user_id"),
            patient_name=patient_data.get("name", "Anonymous"),
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

def get_consultations():
    db = SessionLocal()
    try:
        results = db.query(Consultation).order_by(desc(Consultation.created_at)).limit(50).all()
        return [
            {
                "id": r.id,
                "name": r.patient_name,
                "age": r.age,
                "disease": r.predicted_disease,
                "triage": r.triage.get("level", "LOW") if r.triage else "LOW",
                "date": r.created_at.strftime("%b %d, %Y") if r.created_at else "Unknown",
                "drug": r.treatment.get("recommended_drug", "None") if r.treatment else "None",
                "symptoms": r.symptoms
            }
            for r in results
        ]
    finally:
        db.close()

def get_analytics():
    db = SessionLocal()
    try:
        diseases = db.query(Consultation.predicted_disease, func.count(Consultation.id))\
                     .group_by(Consultation.predicted_disease)\
                     .order_by(desc(func.count(Consultation.id))).all()

        total = int(db.query(func.count(Consultation.id)).scalar() or 1)
        triage_counts = {"LOW": 0, "MODERATE": 0, "HIGH": 0}
        all_consults = db.query(Consultation.triage).all()
        for c in all_consults:
            lvl = c.triage.get("level", "LOW") if c.triage else "LOW"
            if lvl in triage_counts:
                triage_counts[lvl] += 1
            else:
                triage_counts[lvl] = 1

        return {
            "diseases": [{"disease": d[0], "count": d[1], "color": "#3b7eff"} for d in diseases[:6]],
            "triage": [
                {"level": "LOW", "count": triage_counts["LOW"], "pct": int((triage_counts["LOW"]/total)*100), "color": "#30d158"},
                {"level": "MODERATE", "count": triage_counts["MODERATE"], "pct": int((triage_counts["MODERATE"]/total)*100), "color": "#ffd60a"},
                {"level": "HIGH", "count": triage_counts["HIGH"], "pct": int((triage_counts["HIGH"]/total)*100), "color": "#ff453a"}
            ],
            "agents": [
                {"name": "PatientAgent", "latency": "84ms"},
                {"name": "DiagnosisAgent", "latency": "142ms"},
                {"name": "DrugAgent", "latency": "12ms"},
                {"name": "QuestionAgent", "latency": "640ms"},
                {"name": "DecisionAgent", "latency": "810ms"}
            ]
        }
    finally:
        db.close()