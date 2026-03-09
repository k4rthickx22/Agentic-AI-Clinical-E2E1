from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")  # doctor, resident, nurse, patient
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Consultation(Base):

    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # FK to users.id (optional)
    patient_name = Column(String, default="Anonymous")
    age = Column(Integer)
    gender = Column(String)
    symptoms = Column(Text)
    predicted_disease = Column(String)
    treatment = Column(JSON)
    triage = Column(JSON)
    drug_safety = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
