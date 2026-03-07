from sqlalchemy import Column, Integer, String, Text, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Consultation(Base):

    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)

    age = Column(Integer)
    gender = Column(String)

    symptoms = Column(Text)

    predicted_disease = Column(String)

    treatment = Column(JSON)

    triage = Column(JSON)

    drug_safety = Column(JSON)