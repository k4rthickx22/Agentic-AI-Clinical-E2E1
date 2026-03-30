from database.db import SessionLocal
from database.models import Consultation
from sqlalchemy import desc, func


def clean_text(s: str) -> str:
    """Fix Windows-1252 mojibake that can appear in dosage/duration stored in SQLite."""
    if not s or not isinstance(s, str):
        return s
    return (
        s.replace("\u00e2\u0080\u0093", "\u2013")  # en-dash
         .replace("\u00e2\u0080\u0094", "\u2014")  # em-dash
         .replace("\u00e2\u0080\u0099", "\u2019")  # right single quote
         .replace("\u00e2\u0080\u009c", "\u201c")  # left double quote
         .replace("\u00e2\u0080\u009d", "\u201d")  # right double quote
    )

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


def get_user_consultations(user_id: int):
    """Get consultations for a specific logged-in user."""
    db = SessionLocal()
    try:
        results = (
            db.query(Consultation)
            .filter(Consultation.user_id == user_id)
            .order_by(desc(Consultation.created_at))
            .limit(100)
            .all()
        )
        return [
            {
                "id": r.id,
                "name": r.patient_name,
                "age": r.age,
                "gender": r.gender,
                "disease": r.predicted_disease,
                "triage": r.triage.get("level", "LOW") if r.triage else "LOW",
                "triage_score": r.triage.get("score", 0) if r.triage else 0,
                "triage_recommendation": r.triage.get("recommendation", "") if r.triage else "",
                "date": r.created_at.strftime("%b %d, %Y · %I:%M %p") if r.created_at else "Unknown",
                "drug": clean_text(r.treatment.get("recommended_drug", "None")) if r.treatment else "None",
                "dosage": clean_text(r.treatment.get("dosage", "As prescribed")) if r.treatment else "As prescribed",
                "duration": clean_text(r.treatment.get("duration", "As advised")) if r.treatment else "As advised",
                "lifestyle": r.treatment.get("lifestyle", []) if r.treatment else [],
                "warnings": r.treatment.get("warnings", []) if r.treatment else [],
                "symptoms": r.symptoms,
                "safety_level": r.drug_safety.get("safety_level", "SAFE") if r.drug_safety else "SAFE",
            }
            for r in results
        ]
    finally:
        db.close()


def get_consultations():
    """Get all consultations (for analytics only)."""
    db = SessionLocal()
    try:
        results = db.query(Consultation).order_by(desc(Consultation.created_at)).limit(200).all()
        return [
            {
                "id": r.id,
                "name": "Anonymous",  # Anonymize for public view
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


def get_user_analytics(user_id: int):
    """Analytics scoped to a specific user's consultations only."""
    db = SessionLocal()
    try:
        diseases = (
            db.query(Consultation.predicted_disease, func.count(Consultation.id))
            .filter(Consultation.user_id == user_id)
            .group_by(Consultation.predicted_disease)
            .order_by(desc(func.count(Consultation.id)))
            .all()
        )

        total = int(
            db.query(func.count(Consultation.id))
            .filter(Consultation.user_id == user_id)
            .scalar() or 1
        )
        triage_counts = {"LOW": 0, "MODERATE": 0, "HIGH": 0}
        user_consults = (
            db.query(Consultation.triage)
            .filter(Consultation.user_id == user_id)
            .all()
        )
        for c in user_consults:
            lvl = c.triage.get("level", "LOW") if c.triage else "LOW"
            triage_counts[lvl] = triage_counts.get(lvl, 0) + 1

        disease_colors = ["#3b7eff", "#5e5ce6", "#30d158", "#ffd60a", "#ff453a", "#bf5af2"]

        return {
            "totalConsultations": total,
            "diseases": [
                {"disease": d[0], "count": d[1], "color": disease_colors[i % len(disease_colors)]}
                for i, d in enumerate(diseases[:6])
            ],
            "triage": [
                {"level": "LOW",      "count": triage_counts["LOW"],      "pct": int((triage_counts["LOW"]      / total) * 100), "color": "#30d158"},
                {"level": "MODERATE", "count": triage_counts["MODERATE"], "pct": int((triage_counts["MODERATE"] / total) * 100), "color": "#ffd60a"},
                {"level": "HIGH",     "count": triage_counts["HIGH"],     "pct": int((triage_counts["HIGH"]     / total) * 100), "color": "#ff453a"},
            ],
            "agents": [
                {"name": "PatientAgent",   "latency": "84ms"},
                {"name": "DiagnosisAgent", "latency": "142ms"},
                {"name": "DrugAgent",      "latency": "12ms"},
                {"name": "QuestionAgent",  "latency": "640ms"},
                {"name": "DecisionAgent",  "latency": "810ms"},
            ],
        }
    finally:
        db.close()


def delete_user_history(user_id: int) -> int:
    """Delete all consultation records for a specific user. Returns count deleted."""
    db = SessionLocal()
    try:
        count = (
            db.query(Consultation)
            .filter(Consultation.user_id == user_id)
            .delete(synchronize_session=False)
        )
        db.commit()
        return count
    finally:
        db.close()