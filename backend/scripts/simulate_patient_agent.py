"""Simulate exactly what patient_agent._analyze_rule_based does"""
import os, joblib

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
model = joblib.load(os.path.join(BASE_DIR, "models", "disease_model.pkl"))

symptoms = "knee pain swollen after running"
probs = model.predict_proba([symptoms])[0]
classes = model.classes_

disease_probs = sorted(
    [{"disease": cls, "probability": float(round(prob, 4))}
     for cls, prob in zip(classes, probs)],
    key=lambda x: x["probability"],
    reverse=True
)

predicted_disease = disease_probs[0]["disease"]

print(f"Predicted: {predicted_disease}")
for d in disease_probs[:5]:
    print(f"  {d['disease']}: {d['probability']*100:.1f}%")

# Also test with "I have a leg pain" like the screenshot showed
symptoms2 = "I have a pain leg pain"
probs2 = model.predict_proba([symptoms2])[0]
classes2 = model.classes_
dp2 = sorted(
    [{"disease": cls, "probability": float(round(prob, 4))}
     for cls, prob in zip(classes2, probs2)],
    key=lambda x: x["probability"],
    reverse=True
)
print(f"\n'I have a pain leg pain': {dp2[0]['disease']} ({dp2[0]['probability']*100:.1f}%)")
for d in dp2[:3]:
    print(f"  {d['disease']}: {d['probability']*100:.1f}%")
