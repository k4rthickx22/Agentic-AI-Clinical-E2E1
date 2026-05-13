
<div align="center">

# 🧠 Agentic AI Clinical Diagnosis System

**A production-grade, multi-agent AI platform for intelligent clinical diagnosis, drug safety evaluation, and personalized treatment planning.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203-FF6B35?style=for-the-badge)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> ⚠️ **Educational & Research Use Only** — This system does not replace professional medical consultation.

</div>

---

## 📖 Overview

The **Agentic AI Clinical Diagnosis System** is a full-stack, end-to-end clinical decision support platform powered by a **multi-agent AI pipeline**. It combines a custom-trained **scikit-learn ML model** with **Groq LLaMA 3** large language models to deliver differential diagnoses, drug safety evaluations, severity triage, and personalized treatment plans — all through a modern, multilingual web interface.

The system uses a **sequential agent orchestration** pattern where each specialized agent handles a distinct clinical reasoning step, mimicking real-world clinical workflows.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **10-Agent Pipeline** | Sequential multi-agent orchestration for end-to-end diagnosis |
| 🧪 **ML + LLM Hybrid** | Custom-trained disease model + Groq LLaMA 3.3-70b fallback |
| 💊 **Drug Safety Engine** | Allergy checks, contraindication detection, age-based dosing |
| 🚨 **Severity Triage** | Weighted scoring for LOW / MODERATE / HIGH emergency levels |
| 🌍 **Multilingual Support** | English, Tamil (தமிழ்), and Hindi (हिंदी) responses |
| 🔊 **Voice Output (TTS)** | gTTS-powered Tamil & Hindi audio via backend proxy |
| 📄 **PDF Report Generation** | Professional clinical reports via ReportLab |
| 💬 **AI Medical Chatbot** | Context-aware chat with Dr. MedAI (Groq LLaMA 3.1-8b) |
| 🔐 **JWT Authentication** | Secure user accounts with token-based auth |
| 📊 **Analytics Dashboard** | Per-user consultation history and health analytics |
| 🏥 **Extended Clinical Module** | Covers MSK, skin, GI, EENT, pediatric & geriatric cases |

---

## 🏗️ Architecture

### Multi-Agent Pipeline (10 Agents)

```
Patient Input
     │
     ▼
┌─────────────────────────────────────────────────────┐
│              ClinicalOrchestrator                   │
│                                                     │
│  1️⃣  PatientAgent      → Symptom extraction + ML   │
│  2️⃣  TriageTreeAgent   → Clinical plausibility     │
│  3️⃣  DiagnosisSupervisor → Primary diagnosis rank  │
│  4️⃣  SafetyAgent       → Over-diagnosis filtering  │
│  5️⃣  QuestionAgent     → Follow-up question gen    │
│  6️⃣  DrugAgent         → Drug options per disease  │
│  7️⃣  RiskAgent         → Drug risk scoring         │
│  8️⃣  DecisionAgent     → Final treatment plan      │
│  9️⃣  SeverityAgent     → Emergency triage scoring  │
│  🔟  ContraAgent       → Contraindication check    │
│  +   DrugInteractionAgent → Interaction detection  │
└─────────────────────────────────────────────────────┘
     │
     ▼
Structured Clinical Report + PDF + Voice
```

### Technology Stack

```
┌─────────────────────┐     ┌──────────────────────────┐
│   FRONTEND          │     │   BACKEND                │
│                     │     │                          │
│  Next.js 16         │────▶│  FastAPI (Python)        │
│  React 19           │     │  Uvicorn ASGI            │
│  TypeScript         │     │                          │
│  Tailwind CSS v4    │     │  ┌────────────────────┐  │
│  Framer Motion      │     │  │  ML Layer          │  │
│  shadcn/ui          │     │  │  scikit-learn 1.8  │  │
│  Lucide Icons       │     │  │  disease_model.pkl │  │
│  jsPDF              │     │  │  joblib / numpy    │  │
│  Axios              │     │  └────────────────────┘  │
└─────────────────────┘     │                          │
                            │  ┌────────────────────┐  │
                            │  │  LLM Layer         │  │
                            │  │  Groq LLaMA 3.3-70b│  │
                            │  │  Groq LLaMA 3.1-8b │  │
                            │  │  (OpenAI optional) │  │
                            │  └────────────────────┘  │
                            │                          │
                            │  SQLite + SQLAlchemy     │
                            │  JWT Auth (python-jose)  │
                            │  ReportLab PDF           │
                            │  gTTS (Voice Output)     │
                            └──────────────────────────┘
```

---

## 📂 Project Structure

```
Agentic-AI-Clinical-E2E1/
│
├── backend/                          # FastAPI Python Backend
│   ├── agents/                       # 🤖 Multi-Agent System (10 agents)
│   │   ├── patient_agent.py          # ML prediction + symptom extraction
│   │   ├── drug_agent.py             # Drug recommendation engine
│   │   ├── risk_agent.py             # Drug risk scoring
│   │   ├── severity_agent.py         # Emergency triage (LOW/MOD/HIGH)
│   │   ├── decision_agent.py         # Final treatment plan builder
│   │   ├── contraindication_agent.py # Drug safety + allergy checks
│   │   ├── interaction_agent.py      # Drug-drug interaction detection
│   │   ├── safety_agent.py           # Over-diagnosis safety filter
│   │   ├── triage_tree_agent.py      # Decision-tree clinical screener
│   │   ├── question_agent.py         # Follow-up question generator
│   │   ├── diagnosis_agent.py        # Diagnosis utility agent
│   │   ├── diagnosis_supervisor.py   # Supervisor: ranks differentials
│   │   ├── symptom_extractor.py      # NLP symptom structuring
│   │   └── extended_clinical_module.py # MSK/Skin/GI/EENT module
│   │
│   ├── api/
│   │   ├── diagnosis_api.py          # Core API: /diagnose, /chat, /tts
│   │   └── auth_api.py               # Auth API: /register, /login
│   │
│   ├── orchestrator/
│   │   └── clinical_orchestrator.py  # Pipeline coordinator
│   │
│   ├── auth/
│   │   └── auth_handler.py           # JWT token generation & verification
│   │
│   ├── models/
│   │   └── disease_model.pkl         # Trained scikit-learn ML model
│   │
│   ├── data/
│   │   ├── treatments.json           # Treatment plans for 30+ diseases
│   │   ├── drugs.csv                 # Drug database (age/allergy-aware)
│   │   └── patient_training_deep.csv # ML training dataset
│   │
│   ├── database/
│   │   ├── db.py                     # SQLAlchemy engine + session
│   │   └── models.py                 # ORM models (User, Consultation)
│   │
│   ├── services/
│   │   └── db_service.py             # DB CRUD operations
│   │
│   ├── utils/
│   │   └── pdf_generator.py          # ReportLab PDF generator
│   │
│   ├── scripts/
│   │   ├── retrain_model.py          # Model retraining script
│   │   ├── enrich_dataset.py         # Dataset enrichment utility
│   │   ├── test_model.py             # Model accuracy testing
│   │   └── simulate_patient_agent.py # Agent simulation tests
│   │
│   ├── main.py                       # FastAPI app entry point
│   ├── requirements.txt              # Python dependencies
│   ├── clinic.db                     # SQLite database
│   └── .env                          # Environment variables (not committed)
│
├── frontend/                         # Next.js 16 Frontend
│   ├── app/
│   │   ├── clinic/page.jsx           # Main diagnosis UI (core page)
│   │   ├── dashboard/                # Analytics dashboard
│   │   ├── profile/                  # User profile & history
│   │   ├── landing/                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── lib/                          # Shared utilities
│   ├── services/                     # API service layer (Axios)
│   ├── package.json
│   └── next.config.ts
│
├── .gitignore
├── pyrightconfig.json                # Python type checking config
└── README.md
```

---

## 🤖 Agent Descriptions

### Core Diagnostic Pipeline

| Agent | Role | Method |
|---|---|---|
| **PatientAgent** | Extracts structured symptoms and runs the ML disease model to generate top-5 differential diagnoses with probabilities | `scikit-learn` + optional OpenAI GPT-4o-mini |
| **SymptomExtractor** | Parses free-text symptoms into structured signals (fever, bleeding, chest pain, etc.) | Rule-based NLP |
| **TriageTreeAgent** | Screens differential diagnoses against clinical plausibility rules | Decision tree logic |
| **DiagnosisSupervisor** | Ranks and selects the primary diagnosis from the screened list | Weighted scoring |
| **SafetyAgent** | Filters over-diagnoses (e.g., prevents flagging Dengue from vague "fever") | Rule-based safety filter |
| **QuestionAgent** | Generates clinically relevant follow-up questions based on suspected diseases | Template + logic |
| **DrugAgent** | Retrieves drug candidates for each differential diagnosis | CSV/JSON lookup |
| **RiskAgent** | Scores drugs for patient-specific risk (age, allergy, comorbidities) | Weighted risk scoring |
| **DecisionAgent** | Builds the final personalized treatment plan from drugs.csv + treatments.json | Data-driven + alias resolution |
| **SeverityAgent** | Assigns emergency triage level (LOW/MODERATE/HIGH) using 5 risk dimensions | Weighted scoring (0–100+) |
| **ContraindicationAgent** | Checks for drug-allergy conflicts, age-contraindications, and disease-specific safety | Rule-based + optional LLM |
| **DrugInteractionAgent** | Detects drug-drug or drug-condition interactions | Rule-based interaction DB |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/diagnose` | Run full 10-agent diagnostic pipeline |
| `POST` | `/api/diagnose/explain` | LLM-powered deep explanation (Groq LLaMA 3.3-70b) |
| `POST` | `/api/diagnose/groq-fallback` | LLM fallback when ML confidence < 35% |
| `POST` | `/api/diagnose/extended` | Extended module for MSK/Skin/GI/EENT/Pediatric |
| `POST` | `/api/chat` | AI Medical Chatbot (Dr. MedAI) |
| `POST` | `/api/tts` | Text-to-Speech proxy (Tamil/Hindi/English) |
| `POST` | `/api/generate_pdf` | Generate professional clinical PDF report |
| `GET` | `/api/history` | Fetch user's consultation history |
| `GET` | `/api/analytics` | User health analytics |
| `DELETE` | `/api/history` | Clear consultation history |
| `PATCH` | `/api/consultation/correct` | Correct last consultation with Groq fallback data |
| `POST` | `/api/register` | Create user account |
| `POST` | `/api/login` | Authenticate and receive JWT |
| `GET` | `/api/health` | Backend health check |

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/landing` | Platform overview and entry point |
| **Clinic (Core)** | `/clinic` | Symptom input → Full diagnosis UI with agents |
| **Dashboard** | `/dashboard` | Analytics, diagnosis history charts |
| **Profile** | `/profile` | User account, consultation records |

---

## ▶️ How to Run the Project

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Groq API Key](https://console.groq.com) (free tier available)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/k4rthickx22/agentic-ai-clinical-system.git
cd agentic-ai-clinical-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_jwt_secret_key_here
# Optional — only needed for LLM-powered agents (PatientAgent / ContraindicationAgent)
OPENAI_API_KEY=your_openai_key_here
```

> 💡 The system works fully with **only `GROQ_API_KEY`**. OpenAI key enables higher-accuracy agent reasoning but is optional.

#### Start the Backend

```bash
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

### 4️⃣ (Optional) Retrain the ML Model

```bash
cd backend
python scripts/retrain_model.py
```

This retrains the `disease_model.pkl` using the `patient_training_deep.csv` dataset.

---

## 📊 Diseases Covered

The system can diagnose and provide treatment plans for **30+ conditions** including:

| Category | Diseases |
|---|---|
| **Fever & Infections** | Viral Fever, Bacterial Fever, Dengue, Malaria, Typhoid, Influenza, COVID-19 |
| **Respiratory** | Pneumonia, Asthma, Bronchitis, Common Cold |
| **Cardiovascular** | Hypertension |
| **Metabolic** | Diabetes Type 1 & 2, Prediabetes, Hypothyroidism, Hyperthyroidism |
| **Digestive** | Gastritis, Gastroenteritis, UTI |
| **Neurological** | Migraine, Tension Headache, Cluster Headache, Sinus Headache |
| **Haematological** | Anemia |
| **Skin & Allergy** | Skin Allergy, Eczema, Urticaria |
| **Extended Module** | MSK pain, nerve pain, EENT, pediatric & geriatric-specific conditions |

---

## 🔒 Safety Features

- **Allergy Contraindication Check** — detects penicillin cross-reactivity, sulfa allergies, NSAID contraindications in Dengue
- **Age-Based Safety Rules** — pediatric (`<12`) and geriatric (`>65`) dosage warnings
- **Reye's Syndrome Prevention** — Aspirin blocked for patients under 16
- **Over-Diagnosis Filter** — SafetyAgent prevents high-confidence ML false positives
- **Emergency Escalation** — CRITICAL triage automatically recommends hospital admission
- **Pregnancy Safeguards** — Flags Category C/D drugs when pregnancy detected
- **LLM Fallback** — Groq LLaMA activates when ML model confidence < 35%

---

## 🌍 Multilingual Support

The system supports full diagnosis responses in:

| Language | Code | Coverage |
|---|---|---|
| English | `en` | Full — all fields |
| Tamil (தமிழ்) | `ta` | Explanation, treatment steps, lifestyle, emergency signs + TTS voice |
| Hindi (हिंदी) | `hi` | Explanation, treatment steps, lifestyle, emergency signs + TTS voice |

---

## 🎯 Future Improvements

- [ ] Real-time LLM streaming responses
- [ ] Integration with FHIR / HL7 medical data standards
- [ ] Semantic symptom similarity using embeddings (FAISS / pgvector)
- [ ] Voice input (speech-to-text) for Tamil symptom entry
- [ ] Clinical dataset training on ICD-10 coded records
- [ ] Role-based access (Doctor / Patient / Admin)
- [ ] Cloud deployment (Render / AWS / Azure)
- [ ] Mobile-first PWA with offline support
- [ ] Real-time drug database via FDA / WHO APIs

---

## 🛠️ Tech Stack Summary

**Backend**
- `FastAPI 0.115` — REST API framework
- `Uvicorn` — ASGI server
- `SQLAlchemy 2.0` + `SQLite` — ORM and database
- `scikit-learn 1.8` + `joblib` — ML model (disease classifier)
- `Groq` (LLaMA 3.1-8b / 3.3-70b) — LLM inference
- `python-jose` + `passlib` + `bcrypt` — JWT authentication
- `ReportLab` + `Pillow` — PDF report generation
- `gTTS` — Google Text-to-Speech (Tamil/Hindi/English)
- `Pydantic v2` — Data validation and schema enforcement
- `python-dotenv` — Environment variable management

**Frontend**
- `Next.js 16` + `React 19` + `TypeScript`
- `Tailwind CSS v4` — Utility-first styling
- `shadcn/ui` + `Radix UI` — Accessible component library
- `Framer Motion` — Animations and transitions
- `Lucide React` — Icon library
- `jsPDF` + `jspdf-autotable` — Client-side PDF generation
- `Axios` — HTTP client for API calls
- `Inter font` — Typography

---

## ⚠️ Disclaimer

> This system is developed for **educational and research purposes only**.  
> It is **not a certified medical device** and does not replace professional clinical consultation.  
> Always consult a licensed healthcare provider for actual medical decisions.  
> Drug recommendations are based on general clinical knowledge and may not account for all individual patient factors.

---

## 👨‍💻 Author

**Karthick Kalaivanan**

[![GitHub](https://img.shields.io/badge/GitHub-k4rthickx22-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/k4rthickx22)

---

<div align="center">

**If you found this project useful, please consider giving it a ⭐ star!**

</div>

