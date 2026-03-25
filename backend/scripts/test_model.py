import joblib

model = joblib.load('models/disease_model.pkl')
tests = [
    'knee pain swollen after running',
    'lower back pain radiating to leg',
    'ankle sprain twisted cannot walk',
    'heartburn acid after eating burning chest',
    'red eye discharge sticky morning',
    'ear pain fever child',
    'constipation hard stool 3 days',
    'sciatica shooting pain down leg',
    'vertigo room spinning dizzy',
    'shoulder pain cannot raise arm frozen',
    'neck pain stiff cannot turn',
    'I have a leg pain',
    'sinusitis blocked nose facial pressure',
    'insomnia cannot sleep',
    'tonsillitis sore throat swollen',
    'muscle strain pulled calf muscle',
]
for t in tests:
    proba = model.predict_proba([t])[0]
    classes = model.classes_
    top = sorted(zip(classes, proba), key=lambda x: -x[1])[:2]
    print(f'"{t[:50]}" -> {[(d, round(p*100,1)) for d,p in top]}')
