from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine
from database.models import Base
from api.diagnosis_api import router as diagnosis_router
from api.auth_api import router as auth_router

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Clinic DSS API", version="2.0.0")

# CORS — allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(diagnosis_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
def home():
    return {"message": "AI Clinic DSS Backend v2.0 Running"}

@app.get("/api/health")
def health():
    """Health check endpoint — used by frontend to verify backend connectivity."""
    try:
        from sqlalchemy import text
        from database.db import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ok", "database": "connected", "version": "2.0.0"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}

