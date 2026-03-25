"""
Extended Clinical Module — handles musculoskeletal, injuries, everyday discomforts,
pediatric/geriatric variants, and rare conditions via Groq web-search fallback.

ACTIVATION: Triggered by orchestrator when:
  - Symptom confidence < 0.65
  - Input contains Extended Trigger Keywords
  - No exact match in primary disease DB
"""

import os
import re
from dotenv import load_dotenv

load_dotenv()

# ─── Trigger Keyword Sets ────────────────────────────────────────────────────

MUSCULOSKELETAL_KEYWORDS = {
    "knee pain","leg pain","thigh pain","calf pain","shin pain","foot pain","heel pain",
    "ankle pain","toe pain","hip pain","groin pain","lower back pain","upper back pain",
    "spine pain","neck pain","shoulder pain","arm pain","elbow pain","forearm pain",
    "wrist pain","hand pain","finger pain","knuckle pain","joint pain","bone pain",
    "muscle pain","muscle cramp","muscle spasm","stiffness","swollen joint","locked joint",
    "clicking joint","backache","back ache","shoulder ache","knee ache","hip ache",
}

INJURY_KEYWORDS = {
    "sprain","strain","pulled muscle","torn ligament","fracture","broken bone","bruise",
    "contusion","cut","laceration","wound","blister","abrasion","dislocation","whiplash",
    "sports injury","fall injury","trauma","twisted ankle","twisted knee","torn muscle",
}

NEUROLOGICAL_KEYWORDS = {
    "numbness","tingling","pins and needles","burning sensation","weakness in limbs",
    "hand weakness","foot drop","nerve pain","radiating pain","shooting pain","sciatica",
    "carpal tunnel","neuropathy","nerve tingling","electric shock sensation",
}

SKIN_KEYWORDS = {
    "skin rash","hives","itching","pruritus","redness","wound infection","abscess","boil",
    "insect bite","dry skin","peeling skin","blistering","bruising easily","eczema",
    "dermatitis","urticaria",
}

DIGESTIVE_KEYWORDS = {
    "bloating","gas","flatulence","belching","heartburn","acid reflux","indigestion",
    "stomach cramps","nausea without vomiting","constipation","loose stools","loss of appetite",
    "acidity","regurgitation","burping",
}

EENT_KEYWORDS = {
    "eye pain","eye strain","red eye","watery eye","blurred vision","ear pain","ear fullness",
    "ringing in ears","tinnitus","nose bleed","blocked nose","post nasal drip",
    "sore throat mild","throat clearing","hoarse voice","dry mouth","toothache","gum pain",
}

GENERAL_KEYWORDS = {
    "fatigue without fever","chronic tiredness","low energy","insomnia","poor sleep",
    "waking at night","drowsiness","dizziness without diagnosis","lightheadedness",
    "vertigo","palpitations","chest tightness","hot flushes","excessive sweating",
    "cold hands","cold feet","weight loss unexplained","weight gain unexplained","hair loss",
}

ALL_EXTENDED_KEYWORDS = (
    MUSCULOSKELETAL_KEYWORDS | INJURY_KEYWORDS | NEUROLOGICAL_KEYWORDS |
    SKIN_KEYWORDS | DIGESTIVE_KEYWORDS | EENT_KEYWORDS | GENERAL_KEYWORDS
)


def check_extended_trigger(symptoms_text: str, confidence_score: float, disease_found_in_db: bool) -> bool:
    """
    Returns True if the Extended Clinical Module should activate.
    Activation conditions:
      1. Confidence score < 0.65
      2. Any extended trigger keyword detected in symptoms
      3. No match in primary disease DB
    """
    if not disease_found_in_db:
        return True
    if confidence_score < 0.65:
        return True
    text_lower = symptoms_text.lower()
    for kw in ALL_EXTENDED_KEYWORDS:
        if kw in text_lower:
            return True
    return False


def get_extended_category(symptoms_text: str) -> list[str]:
    """Identify which extended categories apply to these symptoms."""
    text_lower = symptoms_text.lower()
    categories = []
    if any(kw in text_lower for kw in MUSCULOSKELETAL_KEYWORDS):
        categories.append("MUSCULOSKELETAL")
    if any(kw in text_lower for kw in INJURY_KEYWORDS):
        categories.append("INJURY")
    if any(kw in text_lower for kw in NEUROLOGICAL_KEYWORDS):
        categories.append("NEUROLOGICAL")
    if any(kw in text_lower for kw in SKIN_KEYWORDS):
        categories.append("SKIN")
    if any(kw in text_lower for kw in DIGESTIVE_KEYWORDS):
        categories.append("DIGESTIVE")
    if any(kw in text_lower for kw in EENT_KEYWORDS):
        categories.append("EENT")
    if any(kw in text_lower for kw in GENERAL_KEYWORDS):
        categories.append("GENERAL")
    return categories if categories else ["GENERAL"]


# ─── Pediatric Dosing Helpers ────────────────────────────────────────────────

def get_pediatric_dose(drug: str, weight_kg: float | None = None, age: int = 8) -> str:
    """Return weight-based pediatric dose for common OTC drugs."""
    weight = weight_kg or (age * 3 + 6)  # Rough estimate if not provided
    paracetamol_dose = min(round(15 * weight), 500)
    ibuprofen_dose = min(round(10 * weight), 400)

    drug_lower = drug.lower()
    if "paracetamol" in drug_lower or "acetaminophen" in drug_lower:
        return f"{paracetamol_dose}mg every 6 hours (15mg/kg) [PEDIATRIC DOSE APPLIED]"
    if "ibuprofen" in drug_lower:
        return f"{ibuprofen_dose}mg every 8 hours (10mg/kg) — only if age > 3 months [PEDIATRIC DOSE APPLIED]"
    if "cetirizine" in drug_lower:
        dose = "2.5mg" if age < 6 else "5mg"
        return f"{dose} once daily [PEDIATRIC DOSE APPLIED]"
    return f"Consult pediatrician for weight-based dosing of {drug} [PEDIATRIC DOSE APPLIED]"


def get_geriatric_warning(drug: str) -> str | None:
    """Return geriatric caution for potentially dangerous drugs in elderly."""
    drug_lower = drug.lower()
    if any(x in drug_lower for x in ["ibuprofen", "naproxen", "diclofenac", "nsaid"]):
        return "⚠️ [GERIATRIC CAUTION] NSAIDs risk GI bleed and renal impairment in age > 65. Use lowest dose for shortest time. Prefer Paracetamol 500mg instead."
    if any(x in drug_lower for x in ["chlorphenamine", "promethazine", "diphenhydramine"]):
        return "⚠️ [GERIATRIC CAUTION] Sedating antihistamines cause confusion and fall risk in elderly. Use Cetirizine or Loratadine instead."
    if any(x in drug_lower for x in ["codeine", "tramadol"]):
        return "⚠️ [GERIATRIC CAUTION] Opioids increase fall risk and cause constipation in elderly. Avoid."
    if any(x in drug_lower for x in ["diazepam", "lorazepam", "alprazolam", "clonazepam"]):
        return "⚠️ [GERIATRIC CAUTION] Benzodiazepines significantly increase fall and fracture risk in elderly. Never use for insomnia."
    if any(x in drug_lower for x in ["ciprofloxacin", "levofloxacin", "moxifloxacin"]):
        return "⚠️ [GERIATRIC CAUTION] Fluoroquinolones carry tendon rupture risk in elderly patients. Use with caution."
    return None


# ─── Escalation Safety Checker ───────────────────────────────────────────────

IMMEDIATE_ER_PATTERNS = [
    (r"chest pain.*(arm|jaw|shoulder|radiation|radiat)", "Possible cardiac event — chest pain with radiation"),
    (r"(arm|face).*(weak|droop|numb).*(speech|slur|sudden)", "Possible stroke — FAST protocol"),
    (r"sudden.*(severe|worst).*(headache)", "Possible subarachnoid haemorrhage"),
    (r"(throat|lip|tongue).*(swell).*(breath|difficult|allergen)", "Possible anaphylaxis"),
    (r"calf.*(pain|swell).*(short.*breath|breath.*short)", "Possible DVT/PE"),
    (r"sudden.*vision.*loss", "Retinal emergency"),
    (r"fever.*(stiff neck|neck stiff|photophobia).*(high|39|40|104)", "Possible meningitis"),
    (r"(cannot|can.t|unable).*(walk|bear weight|stand).*(injury|fall|fracture|break)", "Possible fracture — non-weight-bearing"),
    (r"infant.*(fever|temperature).*(3 month|newborn|baby)", "Infant under 3 months with fever — ER immediately"),
]

STROKE_PATTERN = r"(sudden.*numb.*one side|face.*droop|arm.*weak.*sudden|speech.*slur|sudden.*confusion)"


def check_emergency_escalation(symptoms_text: str) -> str | None:
    """
    Returns an emergency message if symptoms match ER red flags.
    Returns None if no emergency detected.
    """
    text_lower = symptoms_text.lower()
    for pattern, reason in IMMEDIATE_ER_PATTERNS:
        if re.search(pattern, text_lower):
            return f"🚨 EMERGENCY: {reason}. Please go to the emergency room immediately or call emergency services."
    if re.search(STROKE_PATTERN, text_lower):
        return "🚨 STROKE ALERT: Sudden one-sided numbness, face drooping, arm weakness, or slurred speech — call emergency services NOW. Time = Brain."
    return None


# ─── Extended Module System Prompt Builder ───────────────────────────────────

EXTENDED_SYSTEM_PROMPT = """You are Dr. MedAI Extended — a highly experienced AI clinical assistant specialising in musculoskeletal conditions, everyday discomforts, injuries, neurological symptoms, and general health concerns.

You apply STRICT clinical rules and output structured JSON ONLY.

OUTPUT FORMAT (respond with valid JSON, no markdown):
{
  "summary": "2-3 sentence clinical summary of what is happening and why",
  "probable_causes": [
    {"rank": 1, "cause": "Most likely cause", "reason": "1-line clinical reason"},
    {"rank": 2, "cause": "Second cause", "reason": "1-line clinical reason"},
    {"rank": 3, "cause": "Third cause", "reason": "1-line clinical reason"}
  ],
  "immediate_home_care": ["Action 1 with duration", "Action 2", "Action 3"],
  "otc_medication": {
    "drug": "Drug name + dose",
    "frequency": "How often",
    "max_duration": "X days",
    "avoid_if": "Allergy/condition/age restriction",
    "alternative": "Alternative if first is contraindicated"
  },
  "physio_advice": ["Exercise/stretch 1 — only for musculoskeletal", "Exercise 2"],
  "avoid_movements": "Movements to avoid (musculoskeletal only, else null)",
  "when_to_see_doctor": ["Red flag 1 — within 48-72 hours", "Red flag 2", "If no improvement after X days"],
  "emergency_signs": ["Only genuine ER-level signs — omit if none apply"],
  "source": "DB_MATCH | WEB_SEARCH | CLINICAL_KNOWLEDGE",
  "severity": "mild | moderate | severe",
  "age_flag": "PEDIATRIC_DOSE_APPLIED | GERIATRIC_CAUTION_APPLIED | null",
  "disclaimer": "AI-assisted guidance only. Consult a licensed physician for diagnosis and treatment."
}

CLINICAL RULES — ALWAYS APPLY:
1. MUSCULOSKELETAL: Acute (<72hr) → RICE (Rest,Ice,Compression,Elevation). Chronic (>2wk) → physio + anti-inflammatory if not contraindicated. Age>50 joint pain → mention osteoarthritis. OTC: Ibuprofen 400mg or Paracetamol 500mg. Topical: Diclofenac gel for localised pain.
2. INJURIES: Sprain/Strain → RICE + immobilise 24-48hr. Fracture suspected → DO NOT mobilise, refer ER for X-ray immediately. Cut/Wound → clean with saline + Povidone-Iodine + sterile dressing. Bruise → cold first 24hr, warm after 48hr.
3. NEUROLOGICAL: Sudden one-sided numbness/weakness → STROKE → ER immediately. Carpal tunnel (wrist+thumb+index numb) → wrist splint + refer. Sciatica → NSAIDs + physio. No OTC for persistent nerve pain >2 weeks.
4. SKIN: Rash/Itch → Cetirizine 10mg + Calamine lotion. Contact dermatitis → identify trigger + Hydrocortisone 1% cream. Infected skin → Mupirocin cream; spreading redness + fever → oral antibiotics needed.
5. DIGESTIVE: Bloating → Simethicone 40mg after meals. Heartburn → Antacid first, Pantoprazole 40mg if persistent. Constipation → hydration + fibre + Lactulose. Nausea → Ginger tea or Ondansetron 4mg. Red flag: weight loss + digestive = urgent referral.
6. EENT: Eye strain → 20-20-20 rule. Red eye + discharge → Chloramphenicol drops. Ear pain child → always refer (no watchful waiting <2yr). Sudden tinnitus → ENT referral.
7. GENERAL: Fatigue without fever → screen anaemia/thyroid/diabetes. Insomnia → sleep hygiene first, no long-term sedatives. Dizziness/BPPV → Epley manoeuvre. Palpitations + irregular → ECG urgently.

PEDIATRIC RULES (age < 12):
- NEVER give Aspirin (Reye syndrome), Codeine, adult antihistamines
- Paracetamol: 15mg/kg every 6h (max 60mg/kg/day)
- Ibuprofen: 10mg/kg every 8h (age > 3 months only; avoid < 6 months)
- Cetirizine: 2.5mg age 2-5; 5mg age 6-11
- Infant <3 months with fever >38°C → ER immediately
- Growth plate fractures in children → always X-ray
- Flag: set age_flag = "PEDIATRIC_DOSE_APPLIED"

GERIATRIC RULES (age > 65):
- Prefer Paracetamol over NSAIDs (GI bleed + renal risk)
- Avoid sedating antihistamines (fall risk) — use Cetirizine/Loratadine
- Avoid Codeine/Tramadol (fall risk, constipation)
- Avoid Benzodiazepines for insomnia (fall + fracture risk)
- New confusion + symptoms → UTI or medication side effect → refer
- Fall + hip/wrist pain → fracture until proven → X-ray
- Flag: set age_flag = "GERIATRIC_CAUTION_APPLIED"

ESCALATION — ALWAYS SCREEN THESE:
Immediately flag as emergency if: chest pain + arm/jaw radiation, sudden severe headache, stroke signs (FAST), anaphylaxis, DVT/PE signs, fever+stiff neck+photophobia, non-weight-bearing after injury, child <3mo with fever

NEVER DO:
- Never prescribe opioids/controlled substances
- Never dismiss chest pain >40yr as musculoskeletal without cardiac workup
- Never restrict fluids in children
- Never contradict existing specialist prescriptions
- Never diagnose cancer or serious chronic disease definitively
"""


def build_extended_prompt(symptoms: str, age: int, gender: str,
                           conditions: str, allergies: str, language: str,
                           categories: list[str], emergency_flag: str | None) -> str:
    """Build the user message for the extended module Groq call."""
    lang_hints = {
        "ta": "RESPOND ENTIRELY IN TAMIL SCRIPT (தமிழ்). All JSON values must be in Tamil.",
        "hi": "RESPOND ENTIRELY IN HINDI SCRIPT (हिंदी). All JSON values must be in Hindi.",
        "en": ""
    }
    lang_hint = lang_hints.get(language, "")

    age_group = "PEDIATRIC (age < 12)" if age < 12 else "GERIATRIC (age > 65)" if age > 65 else "ADULT"

    emergency_note = ""
    if emergency_flag:
        emergency_note = f"\n⚠️ EMERGENCY SCREENING DETECTED: {emergency_flag}\nMake sure to prominently include this in the emergency_signs field.\n"

    return f"""{lang_hint}

Patient Details:
- Symptoms: {symptoms}
- Age: {age} years ({age_group})
- Gender: {gender}
- Pre-existing Conditions: {conditions}
- Known Allergies: {allergies}
- Symptom Categories Detected: {', '.join(categories)}
{emergency_note}
Apply the correct age-group rules (pediatric/geriatric), select the appropriate OTC medication, and provide specific home care, physio advice if musculoskeletal, and clear red flags.
Return ONLY valid JSON. No markdown, no code blocks."""
