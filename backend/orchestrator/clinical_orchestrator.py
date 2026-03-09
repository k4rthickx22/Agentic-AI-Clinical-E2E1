from agents.patient_agent import PatientAgent
from agents.drug_agent import DrugAgent
from agents.risk_agent import RiskAgent
from agents.decision_agent import DecisionAgent
from agents.severity_agent import SeverityAgent
from agents.contraindication_agent import ContraindicationAgent
from agents.diagnosis_supervisor import DiagnosisSupervisor

# NEW AGENTS
from agents.question_agent import QuestionAgent
from agents.safety_agent import SafetyAgent
from agents.triage_tree_agent import TriageTreeAgent


class ClinicalOrchestrator:

    def __init__(self):

        self.patient_agent = PatientAgent()
        self.drug_agent = DrugAgent()
        self.risk_agent = RiskAgent()
        self.decision_agent = DecisionAgent()
        self.severity_agent = SeverityAgent()
        self.contra_agent = ContraindicationAgent()
        self.supervisor = DiagnosisSupervisor()

        # NEW AGENTS
        self.question_agent = QuestionAgent()
        self.safety_agent = SafetyAgent()
        self.triage_tree = TriageTreeAgent()

    def run_pipeline(self, patient_data):

        # -----------------------------
        # 1️⃣ Patient Analysis
        # -----------------------------
        profile = self.patient_agent.analyze_patient(
            age=patient_data["age"],
            gender=patient_data["gender"],
            symptoms=patient_data["symptoms"],
            allergies=patient_data["allergies"],
            conditions=patient_data["conditions"]
        )

        # profile already contains:
        # profile["disease_probabilities"] → Top diseases

        differential = profile["disease_probabilities"]

        # -----------------------------
        # 2️⃣ Decision Tree Screening
        # -----------------------------
        screened_diseases = self.triage_tree.screen_diseases(
            profile,
            differential
        )

        # -----------------------------
        # 3️⃣ Supervisor Ranking
        # -----------------------------
        diagnosis = self.supervisor.select_primary(
            screened_diseases
        )

        # -----------------------------
        # 4️⃣ Safety Filtering
        # -----------------------------
        diagnosis = self.safety_agent.filter_diagnosis(
            profile,
            diagnosis
        )
        
        # KEY BUG FIX: Update the profile with the finalized, filtered diagnosis 
        # so DecisionAgent and RiskAgent don't revert to the raw prediction
        profile["predicted_disease"] = diagnosis["disease"]

        # -----------------------------
        # 5️⃣ Follow-up Questions
        # -----------------------------
        follow_up_questions = self.question_agent.generate_questions(
            patient_data["symptoms"],
            screened_diseases
        )

        # -----------------------------
        # 6️⃣ Drug Recommendation
        # -----------------------------

        # NEW: get drugs for top differential diagnoses
        drug_options = self.drug_agent.get_drugs_for_differential(
            screened_diseases
        )

        ranked_drugs = self.risk_agent.calculate_risk(
            profile,
            drug_options
        )

        # -----------------------------
        # 7️⃣ Final Treatment Decision
        # -----------------------------
        final_decision = self.decision_agent.make_decision(
            profile,
            ranked_drugs
        )

        # -----------------------------
        # 8️⃣ Severity Detection
        # -----------------------------
        severity = self.severity_agent.detect_severity(
            profile
        )

        # -----------------------------
        # 9️⃣ Contraindication Check
        # -----------------------------
        safety = self.contra_agent.evaluate(
            profile,
            final_decision,
            severity
        )
        
        # Override drug if ContraindicationAgent adjusted it due to allergies/safety risks
        if "final_recommendation" in safety:
            final_decision["recommended_drug"] = safety["final_recommendation"]

        # -----------------------------
        # 🔟 Final Response
        # -----------------------------
        return {
            "primary_diagnosis": diagnosis,
            "differential_diagnoses": screened_diseases[:5],
            "follow_up_questions": follow_up_questions,
            "treatment": final_decision,
            "triage": severity,
            "drug_safety": safety,
            "patient_profile": profile
        }