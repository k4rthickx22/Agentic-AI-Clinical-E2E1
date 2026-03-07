from services.voice_agent import VoiceAgent
import requests

voice = VoiceAgent()

# Listen to symptoms
symptoms = voice.listen()

data = {
    "age": 30,
    "gender": "Male",
    "symptoms": symptoms,
    "allergies": "None",
    "conditions": "None"
}

response = requests.post(
    "http://127.0.0.1:8000/diagnose",
    json=data
)

result = response.json()

diagnosis = result["treatment"]["predicted_disease"]
drug = result["treatment"]["recommended_drug"]

message = f"You may have {diagnosis}. Recommended medicine is {drug}"

print(message)

voice.speak(message)