// ───────────────────────────────────────────────
// i18n.js — Multi-language translations
// Supported: en (English), ta (Tamil), hi (Hindi)
// ───────────────────────────────────────────────

export const languages = [
  { code: "en", label: "EN", full: "English" },
  { code: "ta", label: "தமிழ்", full: "Tamil" },
  { code: "hi", label: "हिन्दी", full: "Hindi" },
];

export const translations = {
  en: {
    // Tabs
    diagnose: "Diagnose",
    chat: "AI Chat",
    history: "History",
    analytics: "Analytics",
    profile: "Profile",

    // Diagnose page
    diagnosisTitle: "AI Diagnosis",
    diagnosisSubtitle: "Powered by 10 specialized clinical AI agents",
    patientName: "PATIENT NAME",
    patientNamePlaceholder: "Enter patient name",
    age: "AGE",
    agePlaceholder: "Years",
    gender: "GENDER",
    symptoms: "DESCRIBE SYMPTOMS",
    symptomsPlaceholder: "Describe symptoms in detail, e.g.: I have had high fever for 3 days with headache and body pain...",
    conditions: "PRE-EXISTING CONDITIONS",
    conditionsPlaceholder: "e.g. hypertension, kidney disease",
    allergies: "ALLERGIES",
    allergiesPlaceholder: "e.g. penicillin, sulfa, peanuts",
    runDiagnosis: "Run AI Diagnosis",
    analyzing: "Analyzing...",
    primaryDiagnosis: "PRIMARY DIAGNOSIS",
    treatmentPlan: "TREATMENT PLAN",
    drug: "DRUG",
    dosage: "DOSAGE",
    duration: "DURATION",
    clinicalWarnings: "CLINICAL WARNINGS",
    downloadReport: "Download Clinical Report (.pdf)",
    enterPatientDetails: "Enter patient details to begin",
    aiAgentsWillAnalyze: "10+ specialized AI agents will analyze the symptoms",
    runningAgents: "Running AI Agents...",
    lifestyle: "Lifestyle Recommendations",
    drugSafety: "Drug Safety Assessment",
    safetyLevel: "Safety Level",
    riskScore: "Risk Score",
    noContraindications: "No contraindications detected",
    followUp: "Follow-up Questions",

    // Chat
    chatTitle: "AI Medical Chat",
    chatSubtitle: "Clinical knowledge assistant powered by medical AI",
    chatPlaceholder: "Ask about any disease, medication, or symptom...",

    // History
    historyTitle: "Patient History",
    historySubtitle: "Recent consultations and clinical records",
    records: "Records",
    noRecords: "No records for this filter",
    close: "Close",

    // Analytics
    analyticsTitle: "Analytics",
    analyticsSubtitle: "Clinical intelligence from patient data",
    totalConsultations: "Total Consultations",
    topDiseases: "Top Diagnosed Diseases",
    triageDistribution: "Triage Distribution",
    agentPerformance: "Agent Performance",

    // Profile
    profileTitle: "My Profile",
    profileSubtitle: "Manage your account and view recent activity",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    yourRole: "Role",
    memberSince: "Member Since",
    lastLogin: "Last Login",
    recentActivity: "Recent Activity",
    noActivity: "No consultations found.",
    logout: "Sign Out",
  },

  ta: {
    // Tabs
    diagnose: "நோய் கண்டறிதல்",
    chat: "AI அரட்டை",
    history: "வரலாறு",
    analytics: "பகுப்பாய்வு",
    profile: "சுயவிவரம்",

    // Diagnose
    diagnosisTitle: "AI நோய் கண்டறிதல்",
    diagnosisSubtitle: "10 சிறப்பு மருத்துவ AI முகவர்களால் இயக்கப்படுகிறது",
    patientName: "நோயாளி பெயர்",
    patientNamePlaceholder: "நோயாளி பெயரை உள்ளிடவும்",
    age: "வயது",
    agePlaceholder: "ஆண்டுகள்",
    gender: "பாலினம்",
    symptoms: "அறிகுறிகளை விவரிக்கவும்",
    symptomsPlaceholder: "உங்கள் அறிகுறிகளை விரிவாக விவரிக்கவும்...",
    conditions: "ஏற்கனவே உள்ள நிலைமைகள்",
    conditionsPlaceholder: "எ.கா. உயர் இரத்த அழுத்தம், சிறுநீரக நோய்",
    allergies: "ஒவ்வாமை",
    allergiesPlaceholder: "எ.கா. பெனிசிலின், சல்பா",
    runDiagnosis: "AI கண்டறிதலை இயக்கவும்",
    analyzing: "பகுப்பாய்வு நடக்கிறது...",
    primaryDiagnosis: "முதன்மை நோய் கண்டறிதல்",
    treatmentPlan: "சிகிச்சை திட்டம்",
    drug: "மருந்து",
    dosage: "அளவு",
    duration: "காலம்",
    clinicalWarnings: "மருத்துவ எச்சரிக்கைகள்",
    downloadReport: "மருத்துவ அறிக்கையை பதிவிறக்கவும் (.pdf)",
    enterPatientDetails: "நோய் கண்டறிதலை தொடங்க நோயாளி விவரங்களை உள்ளிடவும்",
    aiAgentsWillAnalyze: "10+ AI முகவர்கள் அறிகுறிகளை பகுப்பாய்வு செய்வார்கள்",
    runningAgents: "AI முகவர்கள் இயங்குகின்றனர்...",
    lifestyle: "வாழ்க்கை முறை பரிந்துரைகள்",
    drugSafety: "மருந்து பாதுகாப்பு மதிப்பீடு",
    safetyLevel: "பாதுகாப்பு நிலை",
    riskScore: "ஆபத்து மதிப்பெண்",
    noContraindications: "எந்த முரண்பாடுகளும் கண்டறியப்படவில்லை",
    followUp: "தொடர்ச்சியான கேள்விகள்",

    // Chat
    chatTitle: "AI மருத்துவ அரட்டை",
    chatSubtitle: "மருத்துவ AI ஆல் இயக்கப்படும் அரட்டை உதவியாளர்",
    chatPlaceholder: "எந்த நோய், மருந்து அல்லது அறிகுறியைப் பற்றியும் கேளுங்கள்...",

    // History
    historyTitle: "நோயாளி வரலாறு",
    historySubtitle: "சமீபத்திய ஆலோசனைகள் மற்றும் மருத்துவ பதிவுகள்",
    records: "பதிவுகள்",
    noRecords: "இந்த வடிப்பானுக்கு பதிவுகள் இல்லை",
    close: "மூடு",

    // Analytics
    analyticsTitle: "பகுப்பாய்வு",
    analyticsSubtitle: "நோயாளி தரவிலிருந்து மருத்துவ நுண்ணறிவு",
    totalConsultations: "மொத்த ஆலோசனைகள்",
    topDiseases: "அதிகம் கண்டறியப்பட்ட நோய்கள்",
    triageDistribution: "தீவிரம் விநியோகம்",
    agentPerformance: "முகவர் செயல்திறன்",

    // Profile
    profileTitle: "என் சுயவிவரம்",
    profileSubtitle: "உங்கள் கணக்கை நிர்வகிக்கவும்",
    editProfile: "சுயவிவரத்தை திருத்தவும்",
    saveChanges: "மாற்றங்களை சேமிக்கவும்",
    cancel: "ரத்துசெய்",
    yourRole: "பங்கு",
    memberSince: "உறுப்பினர் தொடங்கி",
    lastLogin: "கடைசி உள்நுழைவு",
    recentActivity: "சமீபத்திய செயல்பாடு",
    noActivity: "ஆலோசனைகள் எதுவும் இல்லை.",
    logout: "வெளியேறு",
  },

  hi: {
    // Tabs
    diagnose: "निदान",
    chat: "AI चैट",
    history: "इतिहास",
    analytics: "विश्लेषण",
    profile: "प्रोफ़ाइल",

    // Diagnose
    diagnosisTitle: "AI निदान",
    diagnosisSubtitle: "10 विशेष चिकित्सा AI एजेंटों द्वारा संचालित",
    patientName: "रोगी का नाम",
    patientNamePlaceholder: "रोगी का नाम दर्ज करें",
    age: "आयु",
    agePlaceholder: "वर्ष",
    gender: "लिंग",
    symptoms: "लक्षण विवरण",
    symptomsPlaceholder: "अपने लक्षणों का विस्तार से वर्णन करें...",
    conditions: "पहले से मौजूद स्थितियाँ",
    conditionsPlaceholder: "जैसे: उच्च रक्तचाप, गुर्दे की बीमारी",
    allergies: "एलर्जी",
    allergiesPlaceholder: "जैसे: पेनिसिलिन, सल्फा",
    runDiagnosis: "AI निदान चलाएं",
    analyzing: "विश्लेषण हो रहा है...",
    primaryDiagnosis: "प्राथमिक निदान",
    treatmentPlan: "उपचार योजना",
    drug: "दवा",
    dosage: "खुराक",
    duration: "अवधि",
    clinicalWarnings: "चिकित्सीय चेतावनियाँ",
    downloadReport: "नैदानिक रिपोर्ट डाउनलोड करें (.pdf)",
    enterPatientDetails: "निदान शुरू करने के लिए रोगी विवरण दर्ज करें",
    aiAgentsWillAnalyze: "10+ AI एजेंट लक्षणों का विश्लेषण करेंगे",
    runningAgents: "AI एजेंट चल रहे हैं...",
    lifestyle: "जीवनशैली सिफारिशें",
    drugSafety: "दवा सुरक्षा मूल्यांकन",
    safetyLevel: "सुरक्षा स्तर",
    riskScore: "जोखिम स्कोर",
    noContraindications: "कोई प्रतिकूल संकेत नहीं मिला",
    followUp: "अनुवर्ती प्रश्न",

    // Chat
    chatTitle: "AI चिकित्सा चैट",
    chatSubtitle: "चिकित्सा AI द्वारा संचालित चैट सहायक",
    chatPlaceholder: "किसी भी बीमारी, दवा या लक्षण के बारे में पूछें...",

    // History
    historyTitle: "रोगी इतिहास",
    historySubtitle: "हाल के परामर्श और नैदानिक रिकॉर्ड",
    records: "रिकॉर्ड",
    noRecords: "इस फ़िल्टर के लिए कोई रिकॉर्ड नहीं",
    close: "बंद करें",

    // Analytics
    analyticsTitle: "विश्लेषण",
    analyticsSubtitle: "रोगी डेटा से नैदानिक अंतर्दृष्टि",
    totalConsultations: "कुल परामर्श",
    topDiseases: "शीर्ष निदानित रोग",
    triageDistribution: "ट्राइएज वितरण",
    agentPerformance: "एजेंट प्रदर्शन",

    // Profile
    profileTitle: "मेरी प्रोफ़ाइल",
    profileSubtitle: "अपना खाता प्रबंधित करें और हालिया गतिविधि देखें",
    editProfile: "प्रोफ़ाइल संपादित करें",
    saveChanges: "परिवर्तन सहेजें",
    cancel: "रद्द करें",
    yourRole: "भूमिका",
    memberSince: "सदस्य कब से",
    lastLogin: "अंतिम लॉगिन",
    recentActivity: "हालिया गतिविधि",
    noActivity: "कोई परामर्श नहीं मिला।",
    logout: "साइन आउट",
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] || translations.en[key] || key;
}
