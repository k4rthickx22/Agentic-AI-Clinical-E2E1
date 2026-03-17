"""
DrugInteractionAgent — rule-based drug-drug and drug-condition interaction checker.
Runs instantly with no LLM dependency. Returns a list of interaction warnings.
"""


class DrugInteractionAgent:

    # Drug-drug interaction pairs: (trigger_in_drug, flag_in_conditions_or_allergies, warning_message)
    DRUG_DRUG_RULES = [
        ("warfarin", "aspirin",       "⚠️ Warfarin + Aspirin: Major bleeding risk — avoid concurrent use without physician oversight."),
        ("warfarin", "ibuprofen",     "⚠️ Warfarin + Ibuprofen (NSAID): Increased anticoagulation and GI bleeding risk."),
        ("metformin", "contrast",     "⚠️ Metformin should be withheld 48h before/after iodinated contrast dye — risk of lactic acidosis."),
        ("ssri",     "tramadol",      "⚠️ SSRI + Tramadol: Risk of Serotonin Syndrome — avoid combination; use alternative analgesic."),
        ("maoi",     "ssri",          "🚫 MAOI + SSRI: Potentially fatal Serotonin Syndrome — ABSOLUTE contraindication."),
        ("maoi",     "sertraline",    "🚫 MAOI + Sertraline: Potentially fatal Serotonin Syndrome — ABSOLUTE contraindication."),
        ("digoxin",  "amiodarone",    "⚠️ Digoxin + Amiodarone: Amiodarone raises digoxin levels — monitor for toxicity (nausea, visual disturbance)."),
        ("methotrexate", "nsaid",     "⚠️ Methotrexate + NSAIDs: NSAIDs reduce methotrexate clearance — risk of serious toxicity."),
        ("methotrexate", "ibuprofen", "⚠️ Methotrexate + Ibuprofen: Increased methotrexate toxicity risk."),
        ("lithium",  "ibuprofen",     "⚠️ Lithium + Ibuprofen/NSAIDs: NSAIDs raise lithium levels — monitor lithium toxicity signs."),
        ("lithium",  "naproxen",      "⚠️ Lithium + Naproxen: Risk of lithium toxicity — check serum levels frequently."),
        ("azithromycin", "amiodarone","⚠️ Azithromycin + Amiodarone: QT-prolongation risk — may cause life-threatening arrhythmia."),
        ("ciprofloxacin", "antacid",  "⚠️ Ciprofloxacin + Antacids: Antacids reduce ciprofloxacin absorption — separate doses by 2 hours."),
    ]

    # Drug-condition rules: (drug_keyword, condition_keyword, warning_message)
    DRUG_CONDITION_RULES = [
        ("ibuprofen",     "kidney",       "⚠️ Ibuprofen (NSAID) + Renal Disease: NSAIDs can worsen kidney function — avoid if possible."),
        ("naproxen",      "kidney",       "⚠️ Naproxen (NSAID) + Renal Disease: Risk of acute kidney injury — use Paracetamol instead."),
        ("ibuprofen",     "heart",        "⚠️ Ibuprofen (NSAID) + Cardiac History: NSAIDs increase cardiovascular event risk in cardiac patients."),
        ("metformin",     "kidney",       "⚠️ Metformin + Renal Impairment: Contraindicated if eGFR < 30 — risk of lactic acidosis."),
        ("metformin",     "renal",        "⚠️ Metformin + Renal Impairment: Contraindicated if eGFR < 30 — risk of lactic acidosis."),
        ("nitrofurantoin","kidney",       "⚠️ Nitrofurantoin + Renal Failure: Ineffective and toxic in severe renal impairment."),
        ("fluoroquinolone","diabetes",    "⚠️ Fluoroquinolones (Ciprofloxacin/Levofloxacin) + Diabetes: Risk of hypoglycemia or hyperglycemia — monitor blood glucose closely."),
        ("ciprofloxacin", "diabetes",    "⚠️ Ciprofloxacin + Diabetes: Monitor blood glucose — fluoroquinolones disrupt glucose regulation."),
        ("corticosteroid","diabetes",    "⚠️ Corticosteroids + Diabetes: Steroids raise blood glucose significantly — intensive monitoring required."),
        ("prednisolone",  "diabetes",    "⚠️ Prednisolone + Diabetes: Monitor blood glucose daily during steroid therapy."),
        ("aspirin",       "liver",        "⚠️ Aspirin + Liver Disease: Increased risk of GI bleeding and impaired clotting — use with caution."),
        ("paracetamol",   "liver",        "⚠️ Paracetamol + Liver Disease: Reduce dose to max 2g/day in hepatic impairment — avoid in severe liver failure."),
        ("amlodipine",    "liver",        "⚠️ Amlodipine + Liver Disease: Hepatic metabolism impaired — start at lowest dose (2.5mg)."),
        ("ssri",          "pregnant",     "⚠️ SSRI + Pregnancy: Use only if benefits outweigh risks — discuss with obstetrician; avoid in third trimester if possible."),
        ("sertraline",    "pregnant",     "⚠️ Sertraline in Pregnancy: Some risk of neonatal withdrawal syndrome — requires specialist review."),
        ("ibuprofen",     "pregnant",     "🚫 Ibuprofen + Pregnancy: CONTRAINDICATED in 3rd trimester — premature ductus arteriosus closure."),
        ("tetracycline",  "pregnant",     "🚫 Tetracycline + Pregnancy: CONTRAINDICATED — causes fetal bone and teeth damage."),
        ("doxycycline",   "pregnant",     "🚫 Doxycycline + Pregnancy: CONTRAINDICATED — teratogenic."),
    ]

    def check_interactions(self, final_decision: dict, patient_profile: dict) -> list:
        """
        Check for drug interactions and return a list of warning strings.
        Returns [] if no interactions are found.
        """
        drug = str(final_decision.get("recommended_drug", "")).lower()
        conditions = str(patient_profile.get("conditions", "")).lower()
        allergies = str(patient_profile.get("allergies", "")).lower()

        # Combine conditions + allergies for contextual drug checking
        context = conditions + " " + allergies

        interactions = []

        # Check drug-drug interactions (trigger in prescribed drug, flag in patient context)
        for trigger, flag, warning in self.DRUG_DRUG_RULES:
            if trigger in drug and flag in context:
                interactions.append(warning)

        # Check drug-condition interactions
        for drug_kw, condition_kw, warning in self.DRUG_CONDITION_RULES:
            if drug_kw in drug and condition_kw in context:
                interactions.append(warning)

        return interactions
