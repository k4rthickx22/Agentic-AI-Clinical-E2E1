import sys
import os
import json

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from orchestrator.clinical_orchestrator import ClinicalOrchestrator

try:
    print("Initializing orchestrator...")
    orchestrator = ClinicalOrchestrator()
    print("Orchestrator initialized successfully.")

    patient_data = {
        "age": 35,
        "gender": "male",
        "symptoms": "I have a severe headache, high fever, and some nausea since yesterday.",
        "allergies": "none",
        "conditions": "none"
    }

    print("Running pipeline...")
    result = orchestrator.run_pipeline(patient_data)
    print("Pipeline executed successfully. Result:")
    print(json.dumps(result, indent=2))
except Exception as e:
    import traceback
    traceback.print_exc()
