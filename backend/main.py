from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine
from database.models import Base

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Clinic DSS API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Clinic DSS Backend v2.0 Running"}

from api.diagnosis_api import router as diagnosis_router
from api.auth_api import router as auth_router

app.include_router(diagnosis_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
