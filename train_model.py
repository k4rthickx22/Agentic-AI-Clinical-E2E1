import pandas as pd
import joblib
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

# ---------------------------
# Load Dataset
# ---------------------------
data = pd.read_csv("backend/data/patient_training_deep.csv")

# ---------------------------
# Clean Dataset
# ---------------------------

# remove duplicate rows
data = data.drop_duplicates()

# remove accidental header rows inside dataset
data = data[data["disease"] != "disease"]

# remove empty rows
data = data.dropna()

# reset index
data = data.reset_index(drop=True)

# ---------------------------
# Split Features / Labels
# ---------------------------
X = data["symptoms"]
y = data["disease"]

print("Total Samples:", len(data))
print("Unique Classes:", len(y.unique()))
print("Classes:", y.unique())

print("\nClass Distribution:\n")
print(data["disease"].value_counts())

# ---------------------------
# Build Calibrated NLP Model
# ---------------------------

base_model = LinearSVC(class_weight="balanced")

calibrated_model = CalibratedClassifierCV(base_model)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        max_features=5000
    )),
    ("clf", calibrated_model)
])

# ---------------------------
# Stratified 5-Fold Cross Validation
# ---------------------------

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

cv_scores = cross_val_score(model, X, y, cv=skf)

print("\nCross Validation Accuracy Scores:", cv_scores)
print("Mean CV Accuracy:", np.mean(cv_scores))

# ---------------------------
# Train-Test Split Evaluation
# ---------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("\nHoldout Test Accuracy:", np.mean(y_pred == y_test))

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred, zero_division=0))

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))

# ---------------------------
# Train on Full Dataset
# ---------------------------

model.fit(X, y)

import os
os.makedirs("backend/models", exist_ok=True)

joblib.dump(model, "backend/models/disease_model.pkl")

print("\nModel trained on full dataset and saved successfully!")