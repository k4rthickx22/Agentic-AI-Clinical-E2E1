class QuestionAgent:

    def generate_questions(self, symptoms):

        questions = []

        symptoms = symptoms.lower()

        if "fever" in symptoms:
            questions.extend([
                "Do you have rash?",
                "Do you have joint pain?",
                "Do you have bleeding gums?",
                "Do you feel pain behind the eyes?"
            ])

        if "cough" in symptoms:
            questions.extend([
                "Do you have chest pain?",
                "Do you have breathing difficulty?",
                "Is the cough dry or with mucus?"
            ])

        if "headache" in symptoms:
            questions.extend([
                "Do you have sensitivity to light?",
                "Do you feel neck stiffness?",
                "Do you have nausea or vomiting?"
            ])

        return questions