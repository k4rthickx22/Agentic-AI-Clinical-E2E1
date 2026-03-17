from agents.patient_agent import PatientAgent
from agents.drug_agent import DrugAgent
from agents.risk_agent import RiskAgent
from agents.decision_agent import DecisionAgent
from agents.severity_agent import SeverityAgent
from agents.contraindication_agent import ContraindicationAgent
from agents.diagnosis_supervisor import DiagnosisSupervisor
from agents.interaction_agent import DrugInteractionAgent

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
        self.interaction_agent = DrugInteractionAgent()

        # NEW AGENTS
        self.question_agent = QuestionAgent()
        self.safety_agent = SafetyAgent()
        self.triage_tree = TriageTreeAgent()

    def run_pipeline(self, patient_data):

        reasoning_trace = []

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
        reasoning_trace.append(f"Patient profile built. Top symptom match: {differential[0]['disease']} ({round(differential[0]['probability']*100,1)}% confidence).")

        # -----------------------------
        # 2️⃣ Decision Tree Screening
        # -----------------------------
        screened_diseases = self.triage_tree.screen_diseases(
            profile,
            differential
        )
        reasoning_trace.append(f"Triage tree screened {len(screened_diseases)} differential diagnoses for clinical plausibility.")

        # -----------------------------
        # 3️⃣ Supervisor Ranking
        # -----------------------------
        diagnosis = self.supervisor.select_primary(
            screened_diseases
        )
        reasoning_trace.append(f"Supervisor selected primary diagnosis: {diagnosis['disease']}.")

        # -----------------------------
        # 4️⃣ Safety Filtering
        # -----------------------------
        diagnosis = self.safety_agent.filter_diagnosis(
            profile,
            diagnosis
        )
        if diagnosis.get("flag"):
            reasoning_trace.append(f"Safety agent adjusted diagnosis ({diagnosis['flag']}): {diagnosis['disease']} — over-diagnosis risk reduced.")
        else:
            reasoning_trace.append(f"Safety agent confirmed diagnosis: {diagnosis['disease']} — no over-diagnosis flags raised.")

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
        reasoning_trace.append(f"Treatment decision: {final_decision['recommended_drug']} prescribed for {final_decision['predicted_disease']}. Dosage: {final_decision.get('dosage', 'N/A')}.")

        # -----------------------------
        # 8️⃣ Severity Detection
        # -----------------------------
        severity = self.severity_agent.detect_severity(
            profile
        )
        reasoning_trace.append(f"Triage severity assessed as {severity['level']} (score: {severity['score']}). {len(severity.get('reasons', []))} risk factor(s) identified.")

        # -----------------------------
        # 9️⃣ Contraindication Check
        # -----------------------------
        safety = self.contra_agent.evaluate(
            profile,
            final_decision,
            severity
        )
        reasoning_trace.append(f"Contraindication check: Safety level = {safety['safety_level']} (risk score: {safety['risk_score']}/100). {len(safety.get('clinical_warnings', []))} warning(s) issued.")

        # Override drug if ContraindicationAgent adjusted it due to allergies/safety risks
        if "final_recommendation" in safety:
            final_decision["recommended_drug"] = safety["final_recommendation"]

        # -----------------------------
        # 🔟 Drug Interaction Check
        # -----------------------------
        drug_interactions = self.interaction_agent.check_interactions(
            final_decision,
            profile
        )
        if drug_interactions:
            reasoning_trace.append(f"Drug interaction check: {len(drug_interactions)} interaction(s) detected — review warnings before dispensing.")
        else:
            reasoning_trace.append("Drug interaction check: No significant interactions detected with patient's current conditions/medications.")

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
            "drug_interactions": drug_interactions,
            "reasoning_trace": reasoning_trace,
            "patient_profile": profile
        }