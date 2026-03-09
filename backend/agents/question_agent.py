class QuestionAgent:
    """Generates targeted follow-up questions using instant rule-based logic (no LLM, ~0ms)."""

    DISEASE_QUESTIONS = {
        "Dengue Fever": ["Do you have a skin rash?", "Do you have severe joint or muscle pain?", "Have you noticed any bleeding from gums or nose?"],
        "Normal Fever": ["How many days have you had the fever?", "Do you feel any body aches or chills?", "Have you been near anyone who was sick recently?"],
        "Viral Fever": ["How many days have you had the fever?", "Do you have any additional symptoms like cough or sore throat?", "Have you taken any medication so far?"],
        "Pneumonia": ["Do you have a productive cough with colored mucus?", "Are you experiencing chest pain when breathing?", "Do you feel short of breath even at rest?"],
        "Asthma": ["What triggers your breathing difficulty?", "Do you wheeze when breathing out?", "Do you use an inhaler currently?"],
        "Diabetes": ["Do you feel excessive thirst or hunger?", "Are you urinating more frequently than usual?", "Do you have any blurred vision or slow-healing wounds?"],
        "Hypertension": ["Do you regularly monitor your blood pressure?", "Do you experience frequent headaches or dizziness?", "Are you currently on any blood pressure medication?"],
        "Anemia": ["Do you feel lightheaded when standing up quickly?", "Have you noticed paleness in your skin or eyes?", "Do you feel extreme fatigue despite adequate sleep?"],
        "Malaria": ["Have you visited a mosquito-prone or forested area recently?", "Do you experience cyclical chills followed by sweating?", "Have you had malaria before?"],
        "Common Cold": ["Do you have a blocked or runny nose?", "Do you have a sore or scratchy throat?", "Have you been in contact with someone with a cold recently?"],
        "Gastroenteritis": ["How many times have you had diarrhea today?", "Are you able to keep fluids down?", "Did you eat anything unusual or from outside recently?"],
        "Migraine": ["Is the headache on one side of your head?", "Do you experience nausea or sensitivity to light?", "Does physical activity worsen the headache?"],
        "Urinary Tract Infection": ["Do you feel a burning sensation while urinating?", "Do you need to urinate very frequently?", "Is there any unusual color or smell in your urine?"],
    }

    DEFAULT_QUESTIONS = [
        "How long have you been experiencing these symptoms?",
        "Have you taken any medications on your own?",
        "Do you have any known allergies or medical conditions?"
    ]

    def generate_questions(self, symptoms_text, disease_probs):
        if not disease_probs:
            return self.DEFAULT_QUESTIONS
        top_disease = disease_probs[0]["disease"]
        return self.DISEASE_QUESTIONS.get(top_disease, self.DEFAULT_QUESTIONS)