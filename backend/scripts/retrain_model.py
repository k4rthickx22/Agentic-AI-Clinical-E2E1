"""
Retrains the disease_model.pkl with the enriched patient_training_deep.csv
"""
import os, csv, joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "patient_training_deep.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "disease_model.pkl")

# Load data
symptoms_list, disease_list = [], []
with open(CSV_PATH, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        symptoms_list.append(row['symptoms'].strip())
        disease_list.append(row['disease'].strip())

print(f"Total training samples: {len(symptoms_list)}")
print(f"Unique diseases: {len(set(disease_list))}")
print("Diseases:", sorted(set(disease_list)))

# Split
X_train, X_test, y_train, y_test = train_test_split(
    symptoms_list, disease_list, test_size=0.2, random_state=42, stratify=None
)

# Pipeline: TF-IDF + Logistic Regression (better for medical text than NB)
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        ngram_range=(1, 3),   # unigrams, bigrams, trigrams for "knee pain" etc.
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,
        analyzer='word'
    )),
    ('clf', LogisticRegression(
        max_iter=2000,
        C=5.0,
        solver='lbfgs',
        class_weight='balanced'     # handles class imbalance
    ))
])

pipeline.fit(X_train, y_train)

# Evaluate
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Model Accuracy: {acc*100:.1f}%")
if len(set(y_test)) > 1:
    print(classification_report(y_test, y_pred, zero_division=0))

# Save
joblib.dump(pipeline, MODEL_PATH)
print(f"\n✅ Model saved to: {MODEL_PATH}")

# Test some extended keywords
tests = ["knee pain", "lower back pain", "ankle sprain", "heartburn acid reflux", "red eye", "ear pain child fever", "constipation", "sciatica leg pain", "vertigo spinning"]
for t in tests:
    proba = pipeline.predict_proba([t])[0]
    classes = pipeline.classes_
    top = sorted(zip(classes, proba), key=lambda x: -x[1])[:3]
    print(f"'{t}' → {[(d, round(p*100,1)) for d,p in top]}")
