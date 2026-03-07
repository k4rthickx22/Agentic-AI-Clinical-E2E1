from fastapi import APIRouter
from orchestrator.clinical_orchestrator import ClinicalOrchestrator
from services.db_service import save_consultation

router = APIRouter()

orchestrator = ClinicalOrchestrator()


@router.post("/diagnose")
def diagnose(patient_data: dict):

    # Safe defaults
    patient_data.setdefault("age", 30)
    patient_data.setdefault("gender", "unknown")
    patient_data.setdefault("allergies", "none")
    patient_data.setdefault("conditions", "none")

    if isinstance(patient_data.get("symptoms"), list):
        patient_data["symptoms"] = " ".join(patient_data["symptoms"])

    result = orchestrator.run_pipeline(patient_data)

    save_consultation(patient_data, result)

    return result