"""
Enrich patient_training_deep.csv and drugs.csv, drugs.csv + treatments.json
with all 30 new conditions (musculoskeletal, injury, neurological, EENT,
digestive, skin conditions, general wellness) then retrain the model.
"""

import csv, json, os, sys

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "patient_training_deep.csv")
DRUGS_PATH = os.path.join(BASE_DIR, "data", "drugs.csv")
TREATMENTS_PATH = os.path.join(BASE_DIR, "data", "treatments.json")

# ───────────────────────────────────────────────────────────────────────────────
# 1. NEW TRAINING ROWS — symptoms → disease
# ───────────────────────────────────────────────────────────────────────────────
NEW_TRAINING_ROWS = [
    # ── KNEE PAIN ──────────────────────────────────────────────────────────────
    ("knee pain", "Knee Pain"),
    ("pain in knee", "Knee Pain"),
    ("knee ache", "Knee Pain"),
    ("swollen knee", "Knee Pain"),
    ("knee swelling with pain", "Knee Pain"),
    ("pain when climbing stairs knee", "Knee Pain"),
    ("knee pain after running", "Knee Pain"),
    ("sharp knee pain", "Knee Pain"),
    ("knee pain stiffness morning", "Knee Pain"),
    ("crunching knee sound", "Knee Pain"),
    ("knee locking", "Knee Pain"),
    ("knee gives way", "Knee Pain"),
    ("knee pain elderly arthritis", "Knee Pain"),
    ("knee pain sports injury", "Knee Pain"),
    ("knee pain when bending", "Knee Pain"),
    ("clicking knee joint", "Knee Pain"),
    ("knee cap pain", "Knee Pain"),
    ("patella pain", "Knee Pain"),
    ("runners knee", "Knee Pain"),
    ("knee pain cannot walk", "Knee Pain"),
    # ── LOWER BACK PAIN ────────────────────────────────────────────────────────
    ("lower back pain", "Lower Back Pain"),
    ("low back pain", "Lower Back Pain"),
    ("backache lower", "Lower Back Pain"),
    ("lumbar pain", "Lower Back Pain"),
    ("back pain cannot stand", "Lower Back Pain"),
    ("back pain after lifting", "Lower Back Pain"),
    ("lower back pain radiating to leg", "Lower Back Pain"),
    ("lower back pain morning stiffness", "Lower Back Pain"),
    ("dull ache lower spine", "Lower Back Pain"),
    ("lower back muscle pain", "Lower Back Pain"),
    ("back pain with leg numbness", "Lower Back Pain"),
    ("waist pain", "Lower Back Pain"),
    ("back pain sitting long hours", "Lower Back Pain"),
    ("back pain office worker", "Lower Back Pain"),
    ("coccyx pain", "Lower Back Pain"),
    ("sacrum pain", "Lower Back Pain"),
    ("lumbar spasm", "Lower Back Pain"),
    ("back stiffness morning", "Lower Back Pain"),
    ("back pain radiates buttock", "Lower Back Pain"),
    ("cannot bend back", "Lower Back Pain"),
    # ── SHOULDER PAIN ──────────────────────────────────────────────────────────
    ("shoulder pain", "Shoulder Pain"),
    ("shoulder ache", "Shoulder Pain"),
    ("pain in shoulder", "Shoulder Pain"),
    ("shoulder stiffness", "Shoulder Pain"),
    ("frozen shoulder", "Shoulder Pain"),
    ("cannot raise arm", "Shoulder Pain"),
    ("pain lifting arm shoulder", "Shoulder Pain"),
    ("rotator cuff pain", "Shoulder Pain"),
    ("shoulder pain at night", "Shoulder Pain"),
    ("shoulder clicking pain", "Shoulder Pain"),
    ("shoulder swelling", "Shoulder Pain"),
    ("shoulder injury", "Shoulder Pain"),
    ("pain between shoulder blades", "Shoulder Pain"),
    ("shoulder muscle pain", "Shoulder Pain"),
    ("trapezius pain", "Shoulder Pain"),
    # ── NECK PAIN ──────────────────────────────────────────────────────────────
    ("neck pain", "Neck Pain"),
    ("stiff neck", "Neck Pain"),
    ("neck stiffness", "Neck Pain"),
    ("pain in neck", "Neck Pain"),
    ("neck ache", "Neck Pain"),
    ("cervical pain", "Neck Pain"),
    ("cannot turn neck", "Neck Pain"),
    ("neck pain headache", "Neck Pain"),
    ("whiplash", "Neck Pain"),
    ("neck pain after sleeping", "Neck Pain"),
    ("neck muscle spasm", "Neck Pain"),
    ("neck pain radiates arm", "Neck Pain"),
    ("pain from neck to shoulder", "Neck Pain"),
    ("cervical spondylosis", "Neck Pain"),
    ("desk work neck pain", "Neck Pain"),
    # ── ANKLE SPRAIN ──────────────────────────────────────────────────────────
    ("ankle sprain", "Ankle Sprain"),
    ("sprained ankle", "Ankle Sprain"),
    ("twisted ankle", "Ankle Sprain"),
    ("ankle pain after twist", "Ankle Sprain"),
    ("ankle swelling pain", "Ankle Sprain"),
    ("rolled ankle", "Ankle Sprain"),
    ("ankle cannot bear weight", "Ankle Sprain"),
    ("ankle bruise swelling", "Ankle Sprain"),
    ("ankle injury playing sport", "Ankle Sprain"),
    ("lateral ankle pain", "Ankle Sprain"),
    # ── MUSCLE STRAIN ─────────────────────────────────────────────────────────
    ("muscle strain", "Muscle Strain"),
    ("pulled muscle", "Muscle Strain"),
    ("muscle tear", "Muscle Strain"),
    ("strained muscle", "Muscle Strain"),
    ("hamstring strain", "Muscle Strain"),
    ("calf strain", "Muscle Strain"),
    ("thigh muscle pain", "Muscle Strain"),
    ("muscle pain after exercise", "Muscle Strain"),
    ("soreness after workout", "Muscle Strain"),
    ("muscle cramp calf", "Muscle Strain"),
    ("muscle cramping legs", "Muscle Strain"),
    ("leg cramp night", "Muscle Strain"),
    ("sports muscle injury", "Muscle Strain"),
    ("overuse muscle pain", "Muscle Strain"),
    ("forearm muscle pain", "Muscle Strain"),
    ("hip flexor strain", "Muscle Strain"),
    # ── SCIATICA ──────────────────────────────────────────────────────────────
    ("sciatica", "Sciatica"),
    ("sciatic nerve pain", "Sciatica"),
    ("back pain radiating to leg", "Sciatica"),
    ("shooting pain down leg", "Sciatica"),
    ("pain from back to foot", "Sciatica"),
    ("leg pain with numbness back pain", "Sciatica"),
    ("buttock pain radiating leg", "Sciatica"),
    ("tingling down leg back pain", "Sciatica"),
    ("electric pain down leg", "Sciatica"),
    ("worse when sitting sciatica", "Sciatica"),
    ("pinched nerve back leg", "Sciatica"),
    ("nerve pain leg", "Sciatica"),
    # ── OSTEOARTHRITIS ────────────────────────────────────────────────────────
    ("osteoarthritis", "Osteoarthritis"),
    ("joint pain stiffness elderly", "Osteoarthritis"),
    ("arthritis", "Osteoarthritis"),
    ("joint degeneration", "Osteoarthritis"),
    ("knee arthritis", "Osteoarthritis"),
    ("hip arthritis", "Osteoarthritis"),
    ("joint pain older age", "Osteoarthritis"),
    ("morning stiffness joints", "Osteoarthritis"),
    ("joint pain gets worse activity", "Osteoarthritis"),
    ("bony swelling joints", "Osteoarthritis"),
    ("creaking joints", "Osteoarthritis"),
    ("reduced joint movement", "Osteoarthritis"),
    # ── CARPAL TUNNEL SYNDROME ────────────────────────────────────────────────
    ("carpal tunnel", "Carpal Tunnel Syndrome"),
    ("wrist pain numbness", "Carpal Tunnel Syndrome"),
    ("hand numbness typing", "Carpal Tunnel Syndrome"),
    ("thumb index finger numbness", "Carpal Tunnel Syndrome"),
    ("tingling fingers at night", "Carpal Tunnel Syndrome"),
    ("wrist tingling", "Carpal Tunnel Syndrome"),
    ("numb hands night", "Carpal Tunnel Syndrome"),
    ("wrist pain computer use", "Carpal Tunnel Syndrome"),
    ("dropping things weak hand", "Carpal Tunnel Syndrome"),
    ("burning wrist pain", "Carpal Tunnel Syndrome"),
    # ── TENNIS ELBOW / ELBOW PAIN ─────────────────────────────────────────────
    ("tennis elbow", "Tennis Elbow"),
    ("elbow pain", "Tennis Elbow"),
    ("lateral elbow pain", "Tennis Elbow"),
    ("elbow ache gripping", "Tennis Elbow"),
    ("elbow pain lifting", "Tennis Elbow"),
    ("forearm elbow pain", "Tennis Elbow"),
    ("outer elbow pain", "Tennis Elbow"),
    ("golfers elbow", "Tennis Elbow"),
    ("elbow stiffness pain", "Tennis Elbow"),
    # ── PLANTAR FASCIITIS / HEEL PAIN ─────────────────────────────────────────
    ("heel pain", "Plantar Fasciitis"),
    ("plantar fasciitis", "Plantar Fasciitis"),
    ("foot pain heel morning", "Plantar Fasciitis"),
    ("pain under foot", "Plantar Fasciitis"),
    ("arch pain foot", "Plantar Fasciitis"),
    ("heel pain when walking", "Plantar Fasciitis"),
    ("heel pain after long standing", "Plantar Fasciitis"),
    ("foot sole pain", "Plantar Fasciitis"),
    ("pain first step morning foot", "Plantar Fasciitis"),
    # ── CONJUNCTIVITIS (RED EYE) ──────────────────────────────────────────────
    ("red eye", "Conjunctivitis"),
    ("pink eye", "Conjunctivitis"),
    ("eye redness", "Conjunctivitis"),
    ("watery eye redness", "Conjunctivitis"),
    ("eye discharge redness", "Conjunctivitis"),
    ("sticky eye morning", "Conjunctivitis"),
    ("itchy red eye", "Conjunctivitis"),
    ("conjunctivitis", "Conjunctivitis"),
    ("eye swelling redness", "Conjunctivitis"),
    ("crusting eye", "Conjunctivitis"),
    ("yellow discharge eye", "Conjunctivitis"),
    ("eye burning redness", "Conjunctivitis"),
    # ── EAR INFECTION (OTITIS MEDIA) ──────────────────────────────────────────
    ("ear pain", "Ear Infection"),
    ("earache", "Ear Infection"),
    ("pain in ear", "Ear Infection"),
    ("ear infection", "Ear Infection"),
    ("ear pain fever child", "Ear Infection"),
    ("ear discharge", "Ear Infection"),
    ("muffled hearing ear pain", "Ear Infection"),
    ("ear fullness pain", "Ear Infection"),
    ("otitis", "Ear Infection"),
    ("ear pain after cold", "Ear Infection"),
    ("baby pulling ear crying", "Ear Infection"),
    ("ear ringing pain", "Ear Infection"),
    # ── SINUSITIS ─────────────────────────────────────────────────────────────
    ("sinusitis", "Sinusitis"),
    ("sinus pain", "Sinusitis"),
    ("blocked nose facial pain", "Sinusitis"),
    ("sinus congestion pressure", "Sinusitis"),
    ("facial pressure nose blocked", "Sinusitis"),
    ("pain around eyes nose", "Sinusitis"),
    ("thick nasal discharge headache", "Sinusitis"),
    ("post nasal drip headache", "Sinusitis"),
    ("sinus headache facial pain", "Sinusitis"),
    ("forehead pressure blocked nose", "Sinusitis"),
    ("chronic sinusitis", "Sinusitis"),
    ("nasal congestion facial pain headache", "Sinusitis"),
    # ── ACID REFLUX / GERD ────────────────────────────────────────────────────
    ("acid reflux", "Acid Reflux"),
    ("heartburn", "Acid Reflux"),
    ("GERD", "Acid Reflux"),
    ("burning chest after eating", "Acid Reflux"),
    ("acid indigestion", "Acid Reflux"),
    ("regurgitation sour taste", "Acid Reflux"),
    ("burning throat acid", "Acid Reflux"),
    ("chest burn lying down", "Acid Reflux"),
    ("heartburn at night", "Acid Reflux"),
    ("sour belching", "Acid Reflux"),
    ("discomfort after spicy food", "Acid Reflux"),
    ("burning stomach after meal", "Acid Reflux"),
    ("food coming back up", "Acid Reflux"),
    ("esophageal reflux", "Acid Reflux"),
    ("bloating heartburn", "Acid Reflux"),
    # ── IBS (IRRITABLE BOWEL SYNDROME) ────────────────────────────────────────
    ("IBS", "Irritable Bowel Syndrome"),
    ("irritable bowel", "Irritable Bowel Syndrome"),
    ("stomach cramps loose stools alternating constipation", "Irritable Bowel Syndrome"),
    ("bloating stomach cramps", "Irritable Bowel Syndrome"),
    ("abdominal pain relieved by bowel movement", "Irritable Bowel Syndrome"),
    ("diarrhea and constipation alternating", "Irritable Bowel Syndrome"),
    ("gas bloating abdominal discomfort", "Irritable Bowel Syndrome"),
    ("bowel habit change with cramps", "Irritable Bowel Syndrome"),
    ("mucus in stool with pain", "Irritable Bowel Syndrome"),
    ("cramping flatulence bloating", "Irritable Bowel Syndrome"),
    # ── CONSTIPATION ──────────────────────────────────────────────────────────
    ("constipation", "Constipation"),
    ("no bowel movement", "Constipation"),
    ("hard stools difficult to pass", "Constipation"),
    ("infrequent bowel movements", "Constipation"),
    ("bloating constipation", "Constipation"),
    ("stomach feels full cannot poop", "Constipation"),
    ("straining at toilet", "Constipation"),
    ("pellet like hard stools", "Constipation"),
    ("constipation abdominal pain", "Constipation"),
    ("not passed stool 3 days", "Constipation"),
    # ── TONSILLITIS / SORE THROAT ─────────────────────────────────────────────
    ("tonsillitis", "Tonsillitis"),
    ("sore throat severe", "Tonsillitis"),
    ("swollen tonsils", "Tonsillitis"),
    ("throat pain swallowing", "Tonsillitis"),
    ("painful swallowing throat", "Tonsillitis"),
    ("tonsils swollen fever", "Tonsillitis"),
    ("white spots throat", "Tonsillitis"),
    ("throat red swollen", "Tonsillitis"),
    ("strep throat", "Tonsillitis"),
    ("throat infection fever", "Tonsillitis"),
    ("bad breath sore throat", "Tonsillitis"),
    # ── INSOMNIA ──────────────────────────────────────────────────────────────
    ("insomnia", "Insomnia"),
    ("cannot sleep", "Insomnia"),
    ("sleep disorder", "Insomnia"),
    ("trouble sleeping", "Insomnia"),
    ("waking up at night", "Insomnia"),
    ("cannot fall asleep", "Insomnia"),
    ("poor sleep quality", "Insomnia"),
    ("early morning waking", "Insomnia"),
    ("feeling unrested morning", "Insomnia"),
    ("chronic sleeplessness", "Insomnia"),
    ("sleep deprivation", "Insomnia"),
    # ── VERTIGO / DIZZINESS ───────────────────────────────────────────────────
    ("vertigo", "Vertigo"),
    ("dizziness spinning", "Vertigo"),
    ("room spinning dizziness", "Vertigo"),
    ("BPPV", "Vertigo"),
    ("balance problem dizzy", "Vertigo"),
    ("spinning sensation lying down", "Vertigo"),
    ("positional dizziness", "Vertigo"),
    ("lightheaded turning head", "Vertigo"),
    ("nausea with dizziness spinning", "Vertigo"),
    ("inner ear dizziness", "Vertigo"),
    # ── ANAEMIA ───────────────────────────────────────────────────────────────
    ("anaemia", "Anemia"),
    ("iron deficiency tiredness", "Anemia"),
    ("low haemoglobin symptoms", "Anemia"),
    ("pale skin tiredness breathless", "Anemia"),
    ("fatigue weakness pale nails", "Anemia"),
    ("hair loss fatigue weakness", "Anemia"),
    ("cold hands fatigue pale", "Anemia"),
    ("breathless on exertion fatigue anemia", "Anemia"),
    ("palpitations tiredness anaemia", "Anemia"),
    # ── ANXIETY ───────────────────────────────────────────────────────────────
    ("anxiety", "Anxiety"),
    ("generalised anxiety", "Anxiety"),
    ("excessive worry nervousness", "Anxiety"),
    ("panic attack heart racing", "Anxiety"),
    ("anxious feeling chest tight", "Anxiety"),
    ("racing heart worry", "Anxiety"),
    ("restlessness nervousness anxiety", "Anxiety"),
    ("overthinking cannot relax", "Anxiety"),
    ("fear panic attack", "Anxiety"),
    ("sweating palpitations anxiety", "Anxiety"),
    ("trembling anxiety", "Anxiety"),
    # ── URINARY TRACT INFECTION ───────────────────────────────────────────────
    ("UTI", "UTI"),
    ("burning urination", "UTI"),
    ("pain when passing urine", "UTI"),
    ("frequent urination burning", "UTI"),
    ("urinary infection", "UTI"),
    ("cloudy urine burning", "UTI"),
    ("pelvic pain frequent urination", "UTI"),
    ("urine smells bad burning", "UTI"),
    ("urgency urination pain", "UTI"),
    ("blood in urine burning", "UTI"),
    # ── PILES / HAEMORRHOIDS ──────────────────────────────────────────────────
    ("piles", "Haemorrhoids"),
    ("haemorrhoids", "Haemorrhoids"),
    ("hemorrhoids", "Haemorrhoids"),
    ("bleeding when passing stool", "Haemorrhoids"),
    ("rectal bleeding", "Haemorrhoids"),
    ("anal pain bleeding", "Haemorrhoids"),
    ("itching anus bleeding", "Haemorrhoids"),
    ("lump near anus", "Haemorrhoids"),
    ("pain sitting anal", "Haemorrhoids"),
    ("blood on toilet paper", "Haemorrhoids"),
    # ── MIGRAINE ──────────────────────────────────────────────────────────────
    ("migraine", "Migraine"),
    ("one sided headache", "Migraine"),
    ("pulsating headache nausea", "Migraine"),
    ("throbbing head pain light sensitivity", "Migraine"),
    ("headache vomiting light bothers", "Migraine"),
    ("migraine aura visual", "Migraine"),
    ("severe headache one side nausea", "Migraine"),
    ("headache noise light sensitivity", "Migraine"),
    ("migraine attack", "Migraine"),
    # ── HYPERTENSION ──────────────────────────────────────────────────────────
    ("high blood pressure", "Hypertension"),
    ("hypertension", "Hypertension"),
    ("elevated blood pressure", "Hypertension"),
    ("blood pressure high headache", "Hypertension"),
    ("hypertension dizziness", "Hypertension"),
    ("bp high", "Hypertension"),
    ("blood pressure 140 above", "Hypertension"),
    # ── DIABETES TYPE 2 ───────────────────────────────────────────────────────
    ("diabetes type 2", "Diabetes Type 2"),
    ("high blood sugar", "Diabetes Type 2"),
    ("type 2 diabetes", "Diabetes Type 2"),
    ("excessive thirst frequent urination fatigue", "Diabetes Type 2"),
    ("blurry vision thirst urination frequent", "Diabetes Type 2"),
    ("slow healing wounds diabetes", "Diabetes Type 2"),
    ("tingling feet diabetes", "Diabetes Type 2"),
    ("uncontrolled sugar", "Diabetes Type 2"),
    # Keep existing additions complete
]

# ───────────────────────────────────────────────────────────────────────────────
# 2. NEW DRUG ROWS
# ───────────────────────────────────────────────────────────────────────────────
NEW_DRUG_ROWS = [
    # disease, drug_name, dosage, min_age, max_age, allergy, effectiveness_score, severity_level, cause_keywords, alternative_drug
    ("Knee Pain", "Ibuprofen", "400mg with food every 8h", 18, 65, "Ibuprofen,NSAIDs", 8.2, "moderate", "inflammation,sprain,strain,overuse", "Paracetamol 500mg"),
    ("Knee Pain", "Paracetamol", "500mg every 6h", 5, 99, "Paracetamol", 7.5, "mild", "pain,arthritis,elderly", "Ibuprofen 400mg"),
    ("Knee Pain", "Diclofenac gel", "Apply 3x/day topically", 12, 99, "Diclofenac", 8.0, "mild", "localised pain,inflammation", "Ibuprofen gel"),
    ("Lower Back Pain", "Ibuprofen", "400mg with food every 8h for 5 days", 18, 65, "NSAIDs", 8.3, "moderate", "muscle spasm,disc,inflammation", "Paracetamol 500mg + Diclofenac gel"),
    ("Lower Back Pain", "Paracetamol", "500-1000mg every 6h max 4g/day", 12, 99, "Paracetamol", 7.5, "mild", "back pain,elderly,pregnancy", "Ibuprofen 400mg"),
    ("Lower Back Pain", "Diclofenac gel", "Apply lower back 3x daily", 12, 99, "Diclofenac", 7.8, "mild", "muscle pain,localised", "Voltaren gel"),
    ("Shoulder Pain", "Ibuprofen", "400mg every 8h with food", 18, 65, "NSAIDs", 8.0, "moderate", "rotator cuff,frozen,inflammation", "Paracetamol 500mg"),
    ("Shoulder Pain", "Paracetamol", "500mg every 6h", 12, 99, "Paracetamol", 7.5, "mild", "elderly,mild pain", "Ibuprofen 400mg"),
    ("Neck Pain", "Ibuprofen", "400mg every 8h with food 5 days", 18, 65, "NSAIDs", 8.2, "moderate", "cervical,muscle spasm", "Paracetamol 500mg"),
    ("Neck Pain", "Paracetamol", "500mg every 6h", 12, 99, "Paracetamol", 7.5, "mild", "mild neck pain,elderly", "Ibuprofen 400mg"),
    ("Ankle Sprain", "Ibuprofen", "400mg every 8h with food for 5 days", 18, 65, "NSAIDs", 8.5, "moderate", "sprain,swelling,inflammation", "Paracetamol 500mg"),
    ("Ankle Sprain", "Paracetamol", "500mg every 6h", 5, 99, "Paracetamol", 7.8, "mild", "pain,children,elderly", "Ibuprofen 400mg"),
    ("Muscle Strain", "Ibuprofen", "400mg every 8h with food for 5 days", 18, 65, "NSAIDs", 8.3, "moderate", "muscle tear,inflammation,overuse", "Paracetamol 500mg"),
    ("Muscle Strain", "Paracetamol", "500mg every 6h", 5, 99, "Paracetamol", 7.5, "mild", "strain,cramp,elderly,children", "Ibuprofen 400mg"),
    ("Sciatica", "Ibuprofen", "400mg every 8h with food", 18, 65, "NSAIDs", 8.2, "moderate", "nerve,disc,inflammation", "Paracetamol 500mg"),
    ("Sciatica", "Paracetamol", "1000mg every 6h", 18, 99, "Paracetamol", 7.0, "moderate", "elderly,nerve pain", "Ibuprofen 400mg"),
    ("Osteoarthritis", "Paracetamol", "500-1000mg every 6h (preferred in elderly)", 18, 99, "Paracetamol", 8.0, "chronic", "elderly,arthritis,long-term", "Ibuprofen 400mg short-term"),
    ("Osteoarthritis", "Ibuprofen", "400mg with food every 8h — short-term only", 18, 65, "NSAIDs", 7.8, "moderate", "inflammation,flare-up", "Paracetamol 500mg"),
    ("Carpal Tunnel Syndrome", "Ibuprofen", "400mg with food every 8h for 7 days", 18, 99, "NSAIDs", 7.5, "moderate", "tendon inflammation,nerve compression", "Paracetamol 500mg"),
    ("Tennis Elbow", "Ibuprofen", "400mg every 8h with food for 5 days", 18, 65, "NSAIDs", 8.0, "moderate", "tendinopathy,overuse,repetitive strain", "Paracetamol 500mg"),
    ("Tennis Elbow", "Diclofenac gel", "Apply elbow 3x daily", 12, 99, "Diclofenac", 8.2, "mild", "localised,topical preferred", "Ibuprofen gel"),
    ("Plantar Fasciitis", "Ibuprofen", "400mg with food every 8h for 7 days", 18, 65, "NSAIDs", 7.8, "moderate", "heel inflammation,fascial tear", "Paracetamol 500mg"),
    ("Conjunctivitis", "Chloramphenicol eye drops", "1 drop in affected eye every 2h (awake) — 2 days then every 4h", 1, 99, "Chloramphenicol", 8.5, "mild", "bacterial,red eye,discharge", "Fusidic acid eye drops"),
    ("Ear Infection", "Amoxicillin", "500mg every 8h for 5 days (adult) / 40mg/kg/day in 3 doses (child)", 1, 99, "Penicillin", 8.3, "moderate", "otitis media,bacterial,child fever", "Azithromycin 500mg"),
    ("Sinusitis", "Amoxicillin", "500mg every 8h for 7 days", 5, 99, "Penicillin", 7.8, "moderate", "bacterial sinusitis,facial pain", "Cetirizine 10mg + Nasal decongestant"),
    ("Sinusitis", "Cetirizine", "10mg once daily", 5, 99, "Cetirizine", 7.0, "mild", "allergic sinusitis,congestion", "Loratadine 10mg"),
    ("Acid Reflux", "Pantoprazole", "40mg once daily 30min before breakfast for 4 weeks", 18, 99, "Pantoprazole", 8.8, "moderate", "GERD,reflux,heartburn", "Omeprazole 20mg"),
    ("Acid Reflux", "Antacid (Gelusil/Gaviscon)", "10ml after meals and at bedtime", 5, 99, "None", 7.5, "mild", "acute heartburn,mild reflux", "Pantoprazole 20mg"),
    ("Irritable Bowel Syndrome", "Mebeverine", "135mg 3x/day 20min before meals", 18, 99, "None", 8.0, "moderate", "bowel spasm,cramps,IBS", "Buscopan 10mg"),
    ("Constipation", "Lactulose", "15ml twice daily, titrate to response", 1, 99, "None", 8.2, "mild", "constipation,hard stool,elderly,pregnancy", "Macrogol (Movicol)"),
    ("Tonsillitis", "Amoxicillin", "500mg every 8h for 10 days (strep)", 5, 99, "Penicillin", 8.5, "moderate", "strep,bacterial,severe sore throat", "Azithromycin 500mg"),
    ("Tonsillitis", "Paracetamol", "500-1000mg every 6h for pain", 5, 99, "Paracetamol", 7.5, "mild", "viral tonsillitis,pain relief", "Ibuprofen 400mg"),
    ("Insomnia", "Melatonin", "2mg 30min before bed for max 4 weeks", 18, 99, "None", 7.5, "mild", "sleep onset,circadian,jet lag", "Sleep hygiene first"),
    ("Vertigo", "Cinnarizine", "25mg 3x/day (acute), 75mg SR once daily (prophylaxis)", 18, 99, "Cinnarizine", 8.0, "moderate", "inner ear,BPPV,motion sickness", "Betahistine 16mg"),
    ("Haemorrhoids", "Anusol cream", "Apply to anus 3x/day and after each bowel movement", 18, 99, "None", 7.8, "mild", "piles,anal itching,external haemorrhoid", "Proctosedyl ointment"),
    ("Anxiety", "Propranolol", "10-40mg as needed (situational anxiety)", 18, 65, "Beta-blocker", 7.5, "moderate", "performance anxiety,palpitations", "Refer for CBT"),
]

# ───────────────────────────────────────────────────────────────────────────────
# 3. NEW TREATMENT ENTRIES
# ───────────────────────────────────────────────────────────────────────────────
NEW_TREATMENTS = {
    "Knee Pain": {
        "drug": "Ibuprofen 400mg + Diclofenac gel (topical)",
        "dosage": "Ibuprofen 400mg with food every 8 hours for up to 5 days. Apply Diclofenac gel directly to knee 3 times daily.",
        "duration": "5-7 days for acute pain. If chronic (>2 weeks), physiotherapy evaluation needed.",
        "explanation": "Knee pain arises from inflammation of the joint, ligament strains, cartilage damage, or overuse. NSAIDs reduce inflammation and relieve pain. Topical Diclofenac provides direct anti-inflammatory action without systemic effects.",
        "lifestyle": ["RICE: Rest, Ice (20 min every 2h for first 48h), Compression, Elevation", "Avoid deep squatting, running, and high-impact activities", "Gentle quad strengthening exercises after acute phase", "Use a knee support/brace when walking", "Lose weight if overweight — every kg reduces 4kg force on knee"],
        "when_to_seek_care": "See a doctor if: pain is severe/non-weight-bearing, sudden swelling within 2h of injury, locking/giving way, or no improvement after 7 days of rest.",
        "alternatives": ["Paracetamol 500mg every 6h (preferred for elderly)", "Ibuprofen gel instead of oral if GI-sensitive"],
        "emergency": "Sudden severe swelling + fever + hot joint → possible septic arthritis → Emergency"
    },
    "Lower Back Pain": {
        "drug": "Ibuprofen 400mg + Diclofenac gel",
        "dosage": "Ibuprofen 400mg with food every 8 hours for 5 days. Diclofenac gel apply to lower back 3x daily.",
        "duration": "Acute: 5-7 days. Chronic (>6 weeks): physiotherapy needed.",
        "explanation": "Lower back pain is most commonly caused by muscle spasm, disc bulge, or poor posture. NSAIDs reduce inflammation and speed recovery. Bed rest for >2 days worsens outcomes — staying gently active is better.",
        "lifestyle": ["Gentle walking every hour", "Maintain neutral spine — avoid prolonged sitting", "Heat pad after 48h helps muscle spasm", "Strengthen core muscles (physiotherapy)", "Ergonomic chair and desk setup"],
        "when_to_seek_care": "See doctor if: radiating pain down both legs, bladder/bowel loss, numbness in genital area (cauda equina emergency), or no improvement in 2 weeks.",
        "emergency": "Loss of bladder/bowel control + back pain = Cauda Equina Syndrome — EMERGENCY"
    },
    "Shoulder Pain": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 5-7 days.",
        "duration": "Acute pain: 5-7 days. Frozen shoulder resolves in 12-24 months with physiotherapy.",
        "explanation": "Shoulder pain is commonly caused by rotator cuff injury, frozen shoulder (adhesive capsulitis), or impingement. Anti-inflammatory treatment and specific physiotherapy exercises are the mainstay of treatment.",
        "lifestyle": ["Pendulum exercises gently 3x/day", "Avoid carrying heavy bags on affected side", "Apply ice 20 min after activity in acute phase", "Physiotherapy: specific rotator cuff exercises", "Do not sleep on affected shoulder"],
        "when_to_seek_care": "See doctor if: cannot lift arm above head, pain after trauma, fever + swollen joint, or no improvement in 3 weeks."
    },
    "Neck Pain": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 5 days.",
        "duration": "Acute: 5-7 days. Cervical spondylosis: long-term physiotherapy.",
        "explanation": "Neck pain most commonly results from poor posture (desk work, phone use), muscle spasm, or cervical disc disease. NSAIDs relieve inflammation. Posture correction and neck mobility exercises accelerate recovery.",
        "lifestyle": ["Computer screen at eye level", "Take break every 30 min — chin tucks", "Heat pad for muscle spasm", "Avoid phone use while lying down", "Cervical collar only for short-term acute use"],
        "when_to_seek_care": "See doctor if: pain spreads into arm with numbness, tingling, weakness; sudden severe neck pain after trauma; fever + stiff neck (possible meningitis — EMERGENCY)."
    },
    "Ankle Sprain": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 5 days.",
        "duration": "Grade 1: 1-2 weeks. Grade 2: 3-6 weeks. Grade 3: 3-6 months (may need surgery).",
        "explanation": "Ankle sprains occur when ligaments are overstretched or torn during rolling or twisting. RICE protocol is the first-line treatment. Early controlled movement improves recovery.",
        "lifestyle": ["RICE immediately: Rest, Ice (20 min every 2h), Compression bandage, Elevate above heart", "Crutches if cannot bear weight", "Begin gentle range of motion exercises after 48h", "Proprioception balance exercises when pain allows", "Avoid returning to sport too early"],
        "when_to_seek_care": "See doctor if: cannot bear any weight, visible deformity, severe swelling, or no improvement in 5 days — X-ray to exclude fracture."
    },
    "Muscle Strain": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 5 days.",
        "duration": "Grade 1: 1-2 weeks. Grade 2: 4-6 weeks. Complete tear: 3-6 months.",
        "explanation": "Muscle strains happen when muscle fibres are overstretched or torn. RICE protocol and NSAIDs are the first-line treatment. Gentle stretching after 48h helps recovery.",
        "lifestyle": ["RICE for first 48-72 hours", "Gentle stretching from day 3 (pain-free range)", "Return to activity gradually", "Warm up properly before exercise in future", "Hydration and magnesium for cramp prevention"],
        "when_to_seek_care": "See doctor if: sudden severe pain + pop sound + visible deformity (possible complete tear) or no improvement in 2 weeks."
    },
    "Sciatica": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 5-7 days.",
        "duration": "Acute episode: 4-6 weeks. Chronic: 3-6 months physiotherapy.",
        "explanation": "Sciatica is caused by compression of the sciatic nerve, usually from a herniated disc in the lower back. Pain radiates from lower back through the buttock and down the leg. NSAIDs reduce nerve inflammation.",
        "lifestyle": ["Walking and gentle movement — avoid bed rest", "McKenzie exercises for disc herniation", "Avoid sitting for prolonged periods", "Ice or heat to lower back alternately", "Sleep on side with pillow between knees"],
        "when_to_seek_care": "See doctor if: both legs affected, bladder/bowel incontinence, progressive leg weakness, or no improvement in 4 weeks. These may indicate cauda equina — EMERGENCY.",
        "emergency": "Bilateral leg weakness + bladder/bowel loss = Cauda Equina — Go to ER NOW"
    },
    "Osteoarthritis": {
        "drug": "Paracetamol 500-1000mg (preferred, especially in elderly)",
        "dosage": "500-1000mg every 6 hours, maximum 4g/day. Topical Diclofenac gel as alternative.",
        "duration": "Long-term management — review monthly.",
        "explanation": "Osteoarthritis is the most common form of arthritis, caused by cartilage breakdown in joints (especially knees, hips, hands). It is a chronic condition managed with pain relief, exercise, weight loss, and eventually joint replacement.",
        "lifestyle": ["Low-impact exercise: swimming, cycling, walking", "Lose weight (each kg lost = 4kg less knee force)", "Physiotherapy for strengthening muscles around joint", "Heat for chronic pain, ice for flare-ups", "Walking aids (stick/walker) if needed"],
        "when_to_seek_care": "Refer rheumatology or orthopaedics if: severe joint deformity, loss of function affecting daily life, or considering joint replacement."
    },
    "Carpal Tunnel Syndrome": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 7 days (short-term flare).",
        "duration": "Wrist splint: 6-12 weeks. Surgery if conservative fails.",
        "explanation": "Carpal Tunnel Syndrome is caused by compression of the median nerve at the wrist, causing numbness and tingling in the thumb, index, and middle fingers. Common in office workers and pregnant women.",
        "lifestyle": ["Wear wrist splint at night (maintains neutral wrist position)", "Avoid repetitive wrist flexion", "Take regular breaks from typing/computer", "Ergonomic keyboard and mouse position", "Vitamin B6 supplement (discuss with doctor)"],
        "when_to_seek_care": "Refer to specialist if: muscle wasting at thumb base, constant numbness, or symptoms not controlled after 6 weeks of splinting — consider steroid injection or surgery."
    },
    "Tennis Elbow": {
        "drug": "Diclofenac gel (topical) + Ibuprofen 400mg",
        "dosage": "Diclofenac gel apply to elbow 3-4x daily. Ibuprofen 400mg every 8h with food for 5-7 days if needed.",
        "duration": "6 weeks to 2 years. Most resolve with physiotherapy.",
        "explanation": "Tennis elbow (lateral epicondylitis) is caused by overuse of forearm muscles, causing pain at the outer elbow. Common in people who use a computer mouse, rackets, or perform repetitive manual work.",
        "lifestyle": ["Rest from aggravating activity", "Ice the elbow for 20 min 3x daily", "Eccentric wrist extension exercises (physiotherapy)", "Use tennis elbow clasp/strap when active", "Ergonomic mouse and keyboard setup"],
        "when_to_seek_care": "Refer physiotherapy. See doctor if no improvement after 6 weeks — consider steroid injection or shock wave therapy."
    },
    "Plantar Fasciitis": {
        "drug": "Ibuprofen 400mg",
        "dosage": "400mg with food every 8 hours for 7 days.",
        "duration": "6-12 months with proper stretching and footwear.",
        "explanation": "Plantar fasciitis is inflammation of the thick band of tissue that runs under the foot, causing heel pain — worst in the morning when taking first steps.",
        "lifestyle": ["Calf and plantar fascia stretch before getting out of bed", "Wear supportive footwear — avoid flat shoes, bare feet on hard floors", "Ice the heel 20 min after activity", "Orthotic arch support insoles", "Lose weight if overweight"],
        "when_to_seek_care": "See podiatrist or orthopaedics if no improvement after 6 months — consider steroid injection or shock wave therapy."
    },
    "Conjunctivitis": {
        "drug": "Chloramphenicol eye drops 0.5%",
        "dosage": "1 drop in affected eye every 2 hours while awake for 2 days, then every 4 hours for 5 days.",
        "duration": "5-7 days (bacterial). Viral resolves in 1-2 weeks.",
        "explanation": "Conjunctivitis (red eye) is inflammation of the conjunctiva, most commonly caused by bacterial infection (producing discharge), viral infection, or allergy. Bacterial type responds to antibiotic drops.",
        "lifestyle": ["Wash hands frequently — highly contagious", "Do not share towels or pillowcases", "Remove contact lenses until resolved", "Cool compress for comfort", "Avoid rubbing eyes"],
        "when_to_seek_care": "See doctor if: vision loss, severe eye pain, cloudy cornea, no improvement after 5 days of drops, or newborn with eye discharge (within first month — urgent)."
    },
    "Ear Infection": {
        "drug": "Amoxicillin 500mg",
        "dosage": "Adult: 500mg every 8 hours for 5 days. Child: 40mg/kg/day in 3 divided doses for 5 days.",
        "duration": "5 days (adult), 7-10 days (child under 2 years).",
        "explanation": "Ear infections (otitis media) are most common in children, often following an upper respiratory infection. Bacteria (Streptococcus, Haemophilus) invade the middle ear, causing ear pain, fever, and hearing loss.",
        "lifestyle": ["Pain relief: Paracetamol every 6h (age appropriate)", "Warm pad over ear for comfort", "Keep ear dry — no swimming", "Exclusive breastfeeding reduces ear infection risk in infants", "Complete the antibiotic course even if better"],
        "when_to_seek_care": "See doctor if: discharge from ear, fever persisting beyond 48 hours on antibiotics, child appears very unwell, or repeated ear infections (ENT referral)."
    },
    "Sinusitis": {
        "drug": "Nasal saline rinse + Cetirizine 10mg (allergic) or Amoxicillin 500mg (bacterial)",
        "dosage": "Amoxicillin 500mg every 8h for 7 days if bacterial. Cetirizine 10mg once daily for allergic. Nasal saline rinse 2-3x daily.",
        "duration": "Acute: 7-10 days. Chronic (>12 weeks): ENT referral.",
        "explanation": "Sinusitis is inflammation of the paranasal sinuses, usually following a viral cold (viral sinusitis needs no antibiotics). Bacterial sinusitis causes facial pain, thick yellow/green discharge, and fever. Nasal saline rinses are highly effective.",
        "lifestyle": ["Steam inhalation 10 min twice daily", "Saline nasal rinse (Neti pot or Nasobal)", "Stay hydrated", "Avoid cigarette smoke and allergens", "Elevate head of bed"],
        "when_to_seek_care": "See doctor if: fever > 39°C, severe facial pain, swelling around eye (possible orbital cellulitis — URGENT), or no improvement after 10 days."
    },
    "Acid Reflux": {
        "drug": "Pantoprazole 40mg",
        "dosage": "40mg once daily, 30 minutes before breakfast for 4 weeks.",
        "duration": "4-8 weeks. Lifestyle changes required long-term.",
        "explanation": "Acid reflux (GERD) occurs when stomach acid flows back into the oesophagus, causing heartburn and regurgitation. Proton pump inhibitors (PPIs) reduce acid production and heal the oesophageal lining.",
        "lifestyle": ["Avoid trigger foods: caffeine, alcohol, spicy/fatty food, chocolate, mint", "Eat smaller meals — avoid large meals before bed", "Raise head of bed by 20-30cm", "Lose weight if overweight", "Do not lie down within 3h of eating"],
        "when_to_seek_care": "See doctor if: difficulty swallowing, weight loss, vomiting blood, chest pain (rule out cardiac), or symptoms persist despite 8 weeks of PPI therapy."
    },
    "Irritable Bowel Syndrome": {
        "drug": "Mebeverine 135mg",
        "dosage": "135mg 3 times daily, 20 minutes before meals.",
        "duration": "4-8 weeks (reassess). IBS is a long-term condition needing lifestyle modification.",
        "explanation": "IBS is a functional disorder of the gut characterised by abdominal pain, bloating, and alternating diarrhoea/constipation. Mebeverine relaxes intestinal smooth muscle to reduce spasms.",
        "lifestyle": ["Low-FODMAP diet under dietitian guidance", "Eat regular meals — do not skip", "Reduce caffeine and alcohol", "Exercise regularly to regulate bowel", "Stress management — mindfulness, CBT"],
        "when_to_seek_care": "See doctor if: blood in stool, unintentional weight loss, family history of bowel cancer, or symptoms starting after age 45 — colonoscopy to exclude organic disease."
    },
    "Constipation": {
        "drug": "Lactulose 15ml",
        "dosage": "15ml twice daily initially, adjust to 1-2 soft stools/day.",
        "duration": "Short-term until bowel habit normalised. Address root cause.",
        "explanation": "Constipation occurs when bowel movements are infrequent or difficult. It is commonly caused by low fibre diet, dehydration, inactivity, and medications (iron, opioids). Lactulose is a safe osmotic laxative.",
        "lifestyle": ["Increase dietary fibre (30g/day): fruit, veg, wholegrains", "Drink 2L water/day", "Exercise daily — even walking stimulates bowel", "Respond to urge to defecate immediately", "Correct position on toilet (squatting angle)"],
        "when_to_seek_care": "See doctor if: blood in stool, unexplained weight loss, constipation alternating with diarrhoea (possible bowel cancer), or no improvement with laxatives after 2 weeks."
    },
    "Tonsillitis": {
        "drug": "Amoxicillin 500mg",
        "dosage": "500mg every 8 hours for 10 days (bacterial strep). Child: 40mg/kg/day in 3 doses.",
        "duration": "10 days full course to prevent rheumatic fever.",
        "explanation": "Tonsillitis is inflammation of the tonsils caused by bacterial (Group A Streptococcus) or viral infection. Bacterial tonsillitis requires antibiotics to prevent complications including rheumatic fever.",
        "lifestyle": ["Adequate rest and hydration", "Paracetamol or Ibuprofen for pain and fever", "Gargle warm salt water", "Soft diet — ice cream soothing", "Complete antibiotic course even if better"],
        "when_to_seek_care": "See doctor/ENT if: recurring tonsillitis (5+ times/year), peritonsillar abscess (quinsy — asymmetric swelling pushing uvula to one side), or difficulty breathing/swallowing — URGENT."
    },
    "Insomnia": {
        "drug": "Melatonin 2mg (first line)",
        "dosage": "2mg 30-60 minutes before bed. Short-term use (max 4 weeks).",
        "duration": "Address root cause. Sleep hygiene should be primary intervention.",
        "explanation": "Insomnia is difficulty falling or staying asleep. It is most commonly caused by stress, anxiety, poor sleep hygiene, or irregular circadian rhythm. Melatonin helps synchronise the sleep-wake cycle for sleep-onset insomnia.",
        "lifestyle": ["Fixed sleep and wake time every day", "No screens 1h before bed (blue light reduces melatonin)", "Dark, cool, quiet bedroom", "No caffeine after 2pm", "Wind-down routine: reading, bath, mindfulness"],
        "when_to_seek_care": "See doctor if: insomnia lasting >3 months, daytime impairment, snoring + apnoeas (possible sleep apnoea — sleep study), or underlying anxiety/depression needing treatment."
    },
    "Vertigo": {
        "drug": "Cinnarizine 25mg",
        "dosage": "25mg 3 times daily. For BPPV — Epley manoeuvre is curative and preferred over long-term medication.",
        "duration": "Until symptoms resolve. BPPV usually resolves with Epley manoeuvre in 1-3 sessions.",
        "explanation": "Vertigo is the sensation that the room is spinning, caused by inner ear issues (BPPV, labyrinthitis, vestibular neuritis) or rarely central causes. BPPV (commonest) responds dramatically to the Epley manoeuvre.",
        "lifestyle": ["Epley manoeuvre (BPPV) — perform with guidance", "Move slowly when changing position", "Avoid sudden head movements", "Stay hydrated and avoid salt if Meniere's", "Drive only when fully symptom-free"],
        "when_to_seek_care": "See doctor if: sudden onset with headache + new neurological symptoms (possible stroke — FAST protocol). Vertigo + facial drooping/arm weakness = EMERGENCY."
    },
    "Haemorrhoids": {
        "drug": "Anusol cream / Proctosedyl ointment",
        "dosage": "Apply to affected area 3 times daily and after each bowel movement.",
        "duration": "4-6 weeks for mild-moderate. Persistent cases need surgical evaluation.",
        "explanation": "Haemorrhoids (piles) are swollen blood vessels in the rectum/anus causing pain, itching, and rectal bleeding. Most are internal (higher up) or external (at anal opening). Conservative treatment with topical agents and stool softeners is first-line.",
        "lifestyle": ["High-fibre diet and 2L water/day to prevent straining", "Lactulose if constipated", "Warm sitz baths 15 min after bowel movement", "Do not strain at toilet — respond to urge", "Avoid prolonged sitting on toilet"],
        "when_to_seek_care": "See doctor if: significant rectal bleeding (to rule out bowel cancer especially age>45), persistent severe pain, or prolapsed haemorrhoids — may need banding or surgery."
    },
    "Anxiety": {
        "drug": "Propranolol 10-40mg (situational)",
        "dosage": "10-40mg as a single dose 30 minutes before anxiety-provoking situation (e.g. presentation).",
        "duration": "Short-term situational use only. CBT recommended for generalised anxiety.",
        "explanation": "Anxiety is characterised by excessive worry, palpitations, trembling, and fear. Propranolol blocks the physical symptoms (racing heart, trembling). CBT is the evidence-based treatment for generalised anxiety disorder.",
        "lifestyle": ["Daily exercise: 30 min aerobic", "Meditation or mindfulness 10-20 min morning", "Limit caffeine and alcohol", "Sleep 7-8 hours", "Journaling worry thoughts and challenging them"],
        "when_to_seek_care": "See GP/psychiatrist if: daily anxiety affecting function, panic attacks, depression co-existing, or needing long-term medication — do not self-prescribe anxiolytics."
    }
}

# ─── WRITE patient_training_deep.csv ───────────────────────────────────────────
with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for row in NEW_TRAINING_ROWS:
        writer.writerow(row)
print(f"Added {len(NEW_TRAINING_ROWS)} training rows to patient_training_deep.csv")

# ─── WRITE drugs.csv ───────────────────────────────────────────────────────────
with open(DRUGS_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
print("Drugs.csv fieldnames:", fieldnames)

with open(DRUGS_PATH, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for row in NEW_DRUG_ROWS:
        # disease, drug_name, dosage, min_age, max_age, allergy, effectiveness_score, severity_level, cause_keywords, alternative_drug
        writer.writerow(list(row))
print(f"Added {len(NEW_DRUG_ROWS)} drug rows to drugs.csv")

# ─── WRITE treatments.json ─────────────────────────────────────────────────────
with open(TREATMENTS_PATH, 'r', encoding='utf-8') as f:
    treatments = json.load(f)

for disease, data in NEW_TREATMENTS.items():
    treatments[disease] = data

with open(TREATMENTS_PATH, 'w', encoding='utf-8') as f:
    json.dump(treatments, f, indent=2, ensure_ascii=False)
print(f"Added {len(NEW_TREATMENTS)} treatment entries to treatments.json")

print("\n✅ Dataset enrichment complete! Now run: python retrain_model.py")
