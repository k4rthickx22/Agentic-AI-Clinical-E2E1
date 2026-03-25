import joblib
model = joblib.load('models/disease_model.pkl')
print("Model type:", type(model))
print("Has predict_proba:", hasattr(model, 'predict_proba'))
print("Has classes_:", hasattr(model, 'classes_'))

# Simulate what patient_agent.py does
test = "knee pain swollen"
proba = model.predict_proba([test])[0]
classes = model.classes_
top = sorted(zip(classes, proba), key=lambda x: -x[1])[:3]
print("Test predict:", top[:3])
