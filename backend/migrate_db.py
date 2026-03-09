import sys
import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:root@localhost:5432/agentic_ai_clinic"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE consultations ADD COLUMN patient_name VARCHAR DEFAULT 'Anonymous';"))
        print("Added patient_name column.")
    except Exception as e:
        print("patient_name might already exist.", e)

    try:
        conn.execute(text("ALTER TABLE consultations ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        print("Added created_at column.")
    except Exception as e:
        print("created_at might already exist.", e)

    conn.commit()
    print("Migration complete.")
