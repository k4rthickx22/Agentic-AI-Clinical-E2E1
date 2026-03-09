clinical_protocols = {

    "Normal Fever": {
        "category": "infectious",
        "first_line": "Paracetamol 500mg",
        "dosage": "Every 6 hours if fever > 38.5°C",
        "duration": "3-5 days",
        "explanation": "Paracetamol is safe and effective to reduce fever and body pain in self-limiting viral infections.",
        "lifestyle": [
            "Drink at least 2-3 liters of water daily",
            "Take complete bed rest for 2-3 days",
            "Monitor temperature every 4 hours",
            "Apply cold compress on forehead if temp > 39°C",
            "Eat light, easily digestible foods like porridge, soup",
            "Avoid cold beverages and ice cream",
            "Wear light, breathable cotton clothes",
            "Avoid outdoor activity until fever resolves"
        ],
        "warnings": [
            "Consult doctor if fever persists beyond 5 days",
            "Seek emergency care if fever exceeds 40°C",
            "Watch for rash, bleeding, or joint pain - may indicate Dengue"
        ]
    },

    "Viral Fever": {
        "category": "infectious",
        "first_line": "Paracetamol 500mg",
        "dosage": "Every 6 hours if fever persists",
        "duration": "3-5 days",
        "explanation": "Paracetamol reduces fever and body pain in viral infections.",
        "lifestyle": [
            "Drink plenty of fluids (water, coconut water, ORS)",
            "Take adequate rest - avoid strenuous activity",
            "Monitor temperature regularly",
            "Eat light nutritious meals",
            "Avoid crowded places to prevent spreading infection",
            "Wear a mask if you must go outdoors",
            "Keep your surroundings clean and ventilated"
        ],
        "warnings": [
            "Consult doctor if fever lasts more than 5 days",
            "Watch for rash or sudden platelet drop - may indicate Dengue",
            "Avoid self-medication with antibiotics for viral infections"
        ]
    },

    "Common Cold": {
        "category": "respiratory",
        "first_line": "Paracetamol + Cetirizine",
        "dosage": "Paracetamol every 6 hours, Cetirizine once daily at night",
        "duration": "3-5 days",
        "explanation": "Symptomatic treatment for viral upper respiratory infection.",
        "lifestyle": [
            "Steam inhalation 2-3 times a day with eucalyptus oil",
            "Drink warm liquids - ginger tea, warm water with honey",
            "Gargle with warm saltwater 3 times daily",
            "Rest in a warm, comfortable environment",
            "Blow nose gently; don't sniffle back",
            "Use saline nasal drops to relieve congestion",
            "Consume Vitamin C-rich foods - citrus, amla, tomatoes",
            "Avoid dairy products - they can thicken mucus"
        ],
        "warnings": [
            "Seek medical care if symptoms persist more than 7 days",
            "See a doctor if fever is above 39°C",
            "Avoid sharing utensils - cold viruses are highly contagious"
        ]
    },

    "Influenza": {
        "category": "infectious",
        "first_line": "Oseltamivir 75mg",
        "dosage": "Twice daily for 5 days",
        "duration": "5 days (begin within 48 hours of onset)",
        "explanation": "Antiviral medication that reduces severity and duration of influenza.",
        "lifestyle": [
            "Complete bed rest for the first 3-4 days",
            "Drink 8-10 glasses of fluids daily",
            "Eat protein-rich foods to aid recovery",
            "Avoid exposing others - influenza is highly contagious",
            "Wash hands frequently with soap for 20 seconds",
            "Ventilate your room adequately",
            "Use a humidifier to reduce respiratory discomfort",
            "Consider annual flu vaccination to prevent recurrence"
        ],
        "warnings": [
            "Consult doctor if breathing difficulty occurs",
            "Elderly and immunocompromised need immediate care",
            "Avoid aspirin - risk of Reye's syndrome in children"
        ]
    },

    "Dengue Fever": {
        "category": "infectious",
        "first_line": "Paracetamol (avoid NSAIDs)",
        "dosage": "500mg every 6 hours if fever persists",
        "duration": "5-7 days monitoring",
        "explanation": "Supportive care is the cornerstone of Dengue management. Paracetamol reduces fever. NSAIDs are strictly contraindicated due to bleeding risk.",
        "lifestyle": [
            "Drink 3-4 liters of ORS (oral rehydration solution) daily",
            "Monitor platelet count every 24-48 hours",
            "Complete bed rest - avoid any physical exertion",
            "Eat papaya leaf extract - shown to raise platelet count naturally",
            "Consume foods rich in Vitamin K - green leafy vegetables",
            "Use mosquito nets and repellents to prevent re-infection",
            "Update vaccinations - Dengvaxia vaccine is available",
            "Watch for warning signs such as spontaneous bleeding"
        ],
        "warnings": [
            "AVOID aspirin, ibuprofen - risk of life-threatening bleeding",
            "Seek IMMEDIATE hospital care if bleeding from gums/nose",
            "Go to emergency if you develop severe abdominal pain",
            "Platelet < 20,000 requires hospitalization"
        ]
    },

    "Malaria": {
        "category": "infectious",
        "first_line": "Artemisinin Combination Therapy (ACT)",
        "dosage": "As prescribed by physician based on species",
        "duration": "3-7 days based on Plasmodium type",
        "explanation": "ACT is WHO's recommended first-line treatment for uncomplicated malaria.",
        "lifestyle": [
            "Stay well hydrated - drink at least 3 liters of water",
            "Complete the full antimalarial course - do not stop early",
            "Sleep under insecticide-treated bed nets",
            "Use mosquito repellent (DEET-based) on exposed skin",
            "Eliminate standing water near living areas",
            "Eat nutritious meals to rebuild strength",
            "Avoid alcohol - it increases dehydration and impairs immunity",
            "Get tested for G6PD deficiency before taking Primaquine"
        ],
        "warnings": [
            "Complete the full treatment course even if symptoms improve",
            "Cerebral malaria is a medical emergency - seek immediate care",
            "Tell doctor about all medications to avoid drug interactions"
        ]
    },

    "Pneumonia": {
        "category": "infectious",
        "first_line": "Azithromycin 500mg",
        "dosage": "Once daily for 5 days",
        "duration": "5-7 days",
        "explanation": "Azithromycin treats atypical and community-acquired bacterial pneumonia effectively.",
        "lifestyle": [
            "Complete the full antibiotic course even if feeling better",
            "Rest in an upright position - helps with lung expansion",
            "Practice deep breathing exercises 10 times per hour",
            "Drink 2-3 liters of water daily to thin mucus secretions",
            "Use a cool mist humidifier to ease breathing",
            "Avoid smoking - significantly worsens lung recovery",
            "Eat small, frequent protein-rich meals",
            "Get pneumococcal vaccine to prevent recurrence"
        ],
        "warnings": [
            "Seek emergency care if breathing worsens significantly",
            "Watch for bluish lips/fingernails - sign of low oxygen",
            "Elderly persons (>65) and children need hospital monitoring"
        ]
    },

    "Asthma": {
        "category": "respiratory",
        "first_line": "Salbutamol Inhaler (SABA)",
        "dosage": "1-2 puffs during attack, max 8 puffs/day",
        "duration": "As needed for attacks; controller inhalers daily",
        "explanation": "Salbutamol opens airways rapidly during an attack. Regular ICS (inhaled corticosteroids) prevent future attacks.",
        "lifestyle": [
            "Identify and avoid your specific triggers - dust, pollen, smoke",
            "Install air purifiers with HEPA filters",
            "Always carry your rescue inhaler wherever you go",
            "Rinse mouth after using steroid inhaler to prevent thrush",
            "Practice pursed-lip breathing technique daily",
            "Do low-intensity exercise like swimming - warm humid air helps",
            "Avoid beta-blockers and aspirin - known asthma triggers",
            "Get annual flu vaccination to reduce respiratory infections"
        ],
        "warnings": [
            "Frequent attacks (>2/week) require long-term controller therapy",
            "Life-threatening attacks (status asthmaticus) need ER immediately",
            "Do not stop steroid inhalers abruptly - taper under physician care"
        ]
    },

    "Diabetes": {
        "category": "chronic",
        "first_line": "Metformin 500mg",
        "dosage": "Twice daily after meals",
        "duration": "Long term (as prescribed)",
        "explanation": "Metformin improves insulin sensitivity and reduces glucose production in the liver.",
        "lifestyle": [
            "Follow a low-carbohydrate, low-glycemic index diet",
            "Walk 30 minutes daily - significantly improves insulin sensitivity",
            "Monitor blood glucose fasting and post-meal daily",
            "Avoid refined sugars - candy, white bread, soft drinks",
            "Eat complex carbs - oats, millets, brown rice",
            "Include high fiber vegetables - broccoli, spinach, beans",
            "Stay hydrated - dehydration spikes blood sugar",
            "Check HbA1c every 3 months with your doctor"
        ],
        "warnings": [
            "Check HbA1c every 3 months",
            "Never skip meals when taking insulin or sulfonylureas - risk of hypoglycemia",
            "Inspect feet daily for non-healing wounds",
            "Consult doctor if severe fatigue or confusion occurs"
        ]
    },

    "Hypertension": {
        "category": "chronic",
        "first_line": "Amlodipine 5mg",
        "dosage": "Once daily in the morning",
        "duration": "Long-term (lifestyle change + medication)",
        "explanation": "Amlodipine relaxes and widens blood vessels, reducing blood pressure effectively.",
        "lifestyle": [
            "Adopt the DASH diet - fruits, vegetables, whole grains, low-fat dairy",
            "Reduce salt to less than 5g (1 teaspoon) per day",
            "Exercise 30 minutes daily - brisk walk, cycling, swimming",
            "Achieve and maintain a healthy BMI (18.5-24.9)",
            "Limit alcohol to no more than 1 drink per day",
            "Quit smoking - nicotine raises blood pressure immediately",
            "Practice stress-reduction - yoga, meditation, deep breathing",
            "Monitor blood pressure twice daily and log readings"
        ],
        "warnings": [
            "Never stop medication abruptly - risk of rebound hypertension",
            "Seek emergency care if chest pain, blurred vision, or severe headache",
            "Monitor blood pressure weekly"
        ]
    },

    "Anemia": {
        "category": "blood",
        "first_line": "Ferrous Sulfate 325mg",
        "dosage": "Once daily after meals",
        "duration": "3 months minimum",
        "explanation": "Iron supplementation repletes iron stores and restores hemoglobin levels.",
        "lifestyle": [
            "Eat iron-rich foods - red meat, lentils, spinach, tofu, fortified cereals",
            "Consume Vitamin C alongside iron - lemon juice, orange, amla boost absorption",
            "Avoid tea and coffee within 1-2 hours of iron supplements - tannins block absorption",
            "Cook in cast iron cookware - adds dietary iron",
            "Treat underlying causes - worm infestations, heavy menstruation",
            "Eat folate-rich food - for B12 deficiency anemia",
            "Rest frequently - avoid overexertion until hemoglobin recovers",
            "Repeat hemoglobin test after 1 month to check progress"
        ],
        "warnings": [
            "Repeat hemoglobin test after 1 month",
            "Severe anemia (Hb < 7g/dL) may require transfusion",
            "Rule out GI bleeding if anemia is unexplained"
        ]
    },

    "Gastroenteritis": {
        "category": "digestive",
        "first_line": "Oral Rehydration Solution (ORS)",
        "dosage": "Frequent small sips throughout the day",
        "duration": "Until dehydration and diarrhea resolve (2-5 days)",
        "explanation": "ORS replaces lost fluids and electrolytes, preventing dangerous dehydration.",
        "lifestyle": [
            "Sip ORS or coconut water every 15-20 minutes",
            "Follow the BRAT diet - Bananas, Rice, Applesauce, Toast",
            "Avoid dairy, fatty, spicy foods until diarrhea stops",
            "Wash hands thoroughly before eating and after the toilet",
            "Probiotics (yogurt, Lactobacillus) help restore gut flora",
            "Gradually reintroduce normal foods over 3-4 days",
            "Avoid raw salads and street food during recovery",
            "Sterilize or boil water if tap water safety is uncertain"
        ],
        "warnings": [
            "Seek medical care if severe dehydration, dizziness, or sunken eyes appear",
            "Bloody diarrhea requires immediate medical evaluation",
            "Children and elderly dehydrate very quickly - monitor closely"
        ]
    },

    "Migraine": {
        "category": "neurological",
        "first_line": "Sumatriptan 50mg",
        "dosage": "At onset of migraine attack, may repeat after 2 hours",
        "duration": "As needed (not daily)",
        "explanation": "Triptans are the gold standard for acute migraine relief - they constrict dilated blood vessels.",
        "lifestyle": [
            "Keep a migraine diary to identify personal triggers",
            "Common triggers: stress, skipped meals, bright screens, hormonal changes",
            "Sleep and wake at the same time every day",
            "Stay hydrated - dehydration is a major trigger",
            "Wear blue-light blocking glasses when using screens",
            "Apply cold pack to forehead or neck during attacks",
            "Practice biofeedback and relaxation techniques",
            "Limit caffeine to 1-2 cups per day; avoid abrupt withdrawal"
        ],
        "warnings": [
            "See a neurologist if migraines occur more than 4 times per month",
            "Sudden worst headache of your life requires emergency evaluation",
            "Rebound headache can result from overuse of pain medications"
        ]
    },

    "Urinary Tract Infection": {
        "category": "urological",
        "first_line": "Nitrofurantoin 100mg",
        "dosage": "Twice daily with food",
        "duration": "5-7 days",
        "explanation": "Nitrofurantoin concentrates in the urine and kills the bacteria causing the UTI.",
        "lifestyle": [
            "Drink 2-3 liters of water daily to flush bacteria",
            "Urinate frequently - do not hold urine for long periods",
            "Always wipe front-to-back after bathroom use",
            "Urinate after sexual intercourse to prevent post-coital UTI",
            "Wear breathable cotton underwear",
            "Avoid harsh soaps and feminine hygiene sprays near urethra",
            "Consume unsweetened cranberry juice - may reduce bacterial adhesion",
            "Avoid caffeine and alcohol during treatment - irritate the bladder"
        ],
        "warnings": [
            "Complete the full antibiotic course even if symptoms clear early",
            "Seek emergency care if back/flank pain and fever develop - may be kidney infection",
            "Recurrent UTIs (>3/year) need further urological evaluation"
        ]
    }
}