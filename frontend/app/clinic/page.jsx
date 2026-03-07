"use client";

import { useState, useRef, useEffect } from "react";

const diagnosePatient = async (age, symptoms, gender, conditions) => {
  const response = await fetch("http://127.0.0.1:8000/diagnose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age,
      gender,
      symptoms: symptoms.split(",").map(s => s.trim()),
      conditions: conditions ? conditions.split(",").map(c => c.trim()) : []
    })
  });

  return response.json();
};

const aiChatKnowledge = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes("diabetes")) return "Diabetes is a chronic condition where the body cannot properly regulate blood sugar.\n\nFirst-line treatment: **Metformin 500mg** twice daily after meals. Key lifestyle changes: low-carb diet, 30 mins walking daily, regular HbA1c monitoring every 3 months.";
  if (m.includes("hypertension") || m.includes("blood pressure") || m.includes("bp")) return "**Hypertension** is persistently elevated blood pressure. First-line: **Amlodipine 5mg** once daily.\n\nLifestyle: reduce salt, exercise regularly, avoid smoking. Monitor BP weekly. Seek emergency care if chest pain occurs.";
  if (m.includes("dengue")) return "**Dengue Fever** is a viral mosquito-borne illness. Treatment: **Paracetamol** for fever.\n\nAVOID NSAIDs/Aspirin due to bleeding risk. Monitor platelet count daily. Oral rehydration is critical. Seek hospital care if bleeding occurs.";
  if (m.includes("pneumonia")) return "**Pneumonia** is a bacterial/viral lung infection. First-line antibiotic: **Azithromycin 500mg** once daily for 5 days.\n\nRest, hydration, complete the full antibiotic course. Seek emergency care if breathing worsens significantly.";
  if (m.includes("asthma")) return "**Asthma** causes reversible airway narrowing. Rescue: **Salbutamol Inhaler** (1-2 puffs during attack).\n\nAvoid dust, smoke, pollen triggers. Keep rescue inhaler nearby always. Frequent attacks require preventive therapy evaluation.";
  if (m.includes("anemia")) return "**Anemia** is low hemoglobin/RBC count. Treatment: **Ferrous Sulfate 325mg** once daily after meals for 3 months.\n\nEat iron-rich foods (spinach, lentils, meat) + Vitamin C for better absorption.";
  if (m.includes("cold") || m.includes("sneezing") || m.includes("runny")) return "**Common Cold** is a viral upper respiratory infection. Symptomatic treatment: **Paracetamol + Cetirizine**.\n\nSteam inhalation, warm fluids, adequate rest. No antibiotics needed for viral colds.";
  if (m.includes("fever")) return "**Viral Fever** - Take **Paracetamol 500mg** every 6 hours if fever persists. Drink plenty of fluids, rest well.\n\nConsult a doctor if fever lasts more than 5 days or exceeds 39.4C.";
  if (m.includes("malaria")) return "**Malaria** is treated with **Artemisinin Combination Therapy (ACT)**. Complete the full 3-day course.\n\nStay hydrated, use mosquito nets. Follow up if symptoms do not improve within 48 hours.";
  if (m.includes("hello") || m.includes("hi") || m.includes("hey")) return "Hello! I am your AI Medical Assistant. I can help you understand diagnoses, medications, symptoms, and health guidelines.\n\nAsk me about any condition like diabetes, hypertension, pneumonia, dengue, and more!";
  if (m.includes("thank")) return "You are welcome! Remember, this is for informational purposes. Always consult a qualified healthcare professional for personal medical decisions. Stay healthy!";
  return "I can help with clinical questions about conditions like Diabetes, Hypertension, Dengue, Pneumonia, Asthma, Anemia, Common Cold, Viral Fever, and Malaria.\n\nTry asking: 'What is the treatment for dengue?' or 'Explain diabetes management.'";
};

const BG = "#060912";
const SURFACE = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const ACCENT = "#3b7eff";
const SUCCESS = "#30d158";
const WARNING = "#ffd60a";
const DANGER = "#ff453a";
const TEXT = "#f2f2f7";
const TEXT2 = "rgba(242,242,247,0.55)";
const TEXT3 = "rgba(242,242,247,0.3)";

const patientHistory = [
  { id: 1, name: "Arjun Kumar", age: 34, disease: "Diabetes", triage: "MODERATE", date: "Mar 05, 2026", drug: "Metformin 500mg", symptoms: "Frequent urination, excessive thirst, fatigue" },
  { id: 2, name: "Priya Sharma", age: 52, disease: "Hypertension", triage: "MODERATE", date: "Mar 04, 2026", drug: "Amlodipine 5mg", symptoms: "Persistent headache, dizziness, elevated BP" },
  { id: 3, name: "Ravi Nair", age: 28, disease: "Viral Fever", triage: "LOW", date: "Mar 03, 2026", drug: "Paracetamol 500mg", symptoms: "Mild fever, body ache, fatigue" },
  { id: 4, name: "Sneha Pillai", age: 19, disease: "Asthma", triage: "HIGH", date: "Mar 02, 2026", drug: "Salbutamol Inhaler", symptoms: "Wheezing, chest tightness, breathing difficulty" },
  { id: 5, name: "Karthik Iyer", age: 41, disease: "Pneumonia", triage: "HIGH", date: "Feb 28, 2026", drug: "Azithromycin 500mg", symptoms: "High fever, productive cough, chest pain" },
  { id: 6, name: "Meera Devi", age: 65, disease: "Anemia", triage: "LOW", date: "Feb 27, 2026", drug: "Ferrous Sulfate 325mg", symptoms: "Fatigue, pallor, dizziness, weakness" },
];

const analyticsData = {
  diseases: [
    { disease: "Viral Fever", count: 68, color: ACCENT },
    { disease: "Hypertension", count: 42, color: "#5e5ce6" },
    { disease: "Diabetes", count: 38, color: SUCCESS },
    { disease: "Common Cold", count: 31, color: WARNING },
    { disease: "Pneumonia", count: 24, color: DANGER },
    { disease: "Dengue Fever", count: 18, color: "#ff9f0a" },
    { disease: "Asthma", count: 15, color: "#64d2ff" },
  ],
  triage: [
    { level: "LOW", count: 156, pct: 63, color: SUCCESS },
    { level: "MODERATE", count: 53, pct: 21, color: WARNING },
    { level: "HIGH", count: 38, pct: 15, color: DANGER },
  ],
  agents: [
    { name: "PatientAgent", latency: "12ms" },
    { name: "DiagnosisAgent", latency: "145ms" },
    { name: "DrugAgent", latency: "8ms" },
    { name: "RiskAgent", latency: "5ms" },
    { name: "SeverityAgent", latency: "7ms" },
  ]
};

const injectCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${TEXT};font-family:-apple-system,'SF Pro Display','Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.95)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes waveBar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 18px rgba(255,69,58,0.4)}50%{box-shadow:0 0 38px rgba(255,69,58,0.8)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.glass{background:${SURFACE};border:1px solid ${BORDER};border-radius:18px;backdrop-filter:blur(20px);transition:border-color 0.2s}
.glass:hover{border-color:rgba(255,255,255,0.13)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit}
.btn-primary{background:${ACCENT};color:white;padding:12px 22px}
.btn-primary:hover{background:#2d6fe8;transform:translateY(-1px);box-shadow:0 8px 24px rgba(59,126,255,0.4)}
.btn-primary:disabled{opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{background:${SURFACE};border:1px solid ${BORDER};color:${TEXT2};padding:9px 16px}
.btn-ghost:hover{background:rgba(255,255,255,0.07);color:${TEXT};border-color:rgba(255,255,255,0.14)}
.field{width:100%;background:rgba(255,255,255,0.05);border:1px solid ${BORDER};border-radius:12px;padding:12px 15px;color:${TEXT};font-size:14px;outline:none;transition:all 0.2s;font-family:inherit}
.field::placeholder{color:${TEXT3}}
.field:focus{border-color:${ACCENT};box-shadow:0 0 0 3px rgba(59,126,255,0.12)}
.slink{display:flex;align-items:center;gap:11px;padding:9px 13px;border-radius:10px;color:${TEXT2};font-size:14px;font-weight:500;cursor:pointer;transition:all 0.18s;background:transparent;border:none;width:100%;font-family:inherit}
.slink:hover{background:rgba(255,255,255,0.06);color:${TEXT}}
.slink.active{background:rgba(59,126,255,0.12);color:${ACCENT}}
.skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
.chat-user{display:flex;justify-content:flex-end;animation:fadeUp 0.3s ease}
.chat-ai{display:flex;justify-content:flex-start;gap:10px;animation:fadeUp 0.3s ease;align-items:flex-end}
.bubble-user{background:${ACCENT};color:white;padding:10px 15px;border-radius:17px 17px 4px 17px;max-width:72%;font-size:13.5px;line-height:1.55}
.bubble-ai{background:rgba(255,255,255,0.06);border:1px solid ${BORDER};color:${TEXT};padding:10px 15px;border-radius:17px 17px 17px 4px;max-width:78%;font-size:13.5px;line-height:1.65;white-space:pre-line}
.histrow{display:flex;align-items:center;gap:14px;padding:13px 14px;border-radius:12px;cursor:pointer;transition:all 0.18s;border:1px solid transparent}
.histrow:hover{background:rgba(255,255,255,0.04);border-color:${BORDER}}
.ntab{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.18s;border:none;background:transparent;color:${TEXT2};font-family:inherit}
.ntab:hover{color:${TEXT}}
.ntab.on{background:rgba(59,126,255,0.12);color:${ACCENT}}
`;

const TriageBadge = ({ level }) => {
  const cfg = {
    HIGH: { color: DANGER, bg: "rgba(255,69,58,0.1)", icon: "🚨", label: "HIGH RISK" },
    MODERATE: { color: WARNING, bg: "rgba(255,214,10,0.1)", icon: "⚠️", label: "MODERATE" },
    LOW: { color: SUCCESS, bg: "rgba(48,209,88,0.1)", icon: "✅", label: "LOW RISK" },
  }[level] || { color: TEXT2, bg: "rgba(255,255,255,0.05)", icon: "❓", label: level };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.color}25`, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: cfg.color }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const Gauge = ({ score }) => {
  const pct = Math.min(score, 100);
  const color = pct >= 60 ? DANGER : pct >= 30 ? WARNING : SUCCESS;
  const angle = (pct / 100) * 180 - 90;
  const rad = angle * Math.PI / 180;
  const nx = 55 + 28 * Math.cos(rad - Math.PI / 2);
  const ny = 55 + 28 * Math.sin(rad - Math.PI / 2);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="110" height="62" viewBox="0 0 110 62">
        <path d="M10 55 A45 45 0 0 1 100 55" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" strokeLinecap="round"/>
        <path d="M10 55 A45 45 0 0 1 100 55" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${(pct/100)*141.4} 141.4`} style={{ transition: "stroke-dasharray 1.2s ease, stroke 0.3s" }}/>
        <line x1="55" y1="55" x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 1.2s ease" }}/>
        <circle cx="55" cy="55" r="4" fill={color} style={{ transition: "fill 0.3s" }}/>
      </svg>
      <div style={{ textAlign: "center", marginTop: -6 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 10, color: TEXT3, marginTop: 2, letterSpacing: "0.05em" }}>RISK SCORE</div>
      </div>
    </div>
  );
};

const ProbChart = ({ data }) => {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 300); return () => clearTimeout(t); }, [data]);
  const colors = [ACCENT, "#5e5ce6", SUCCESS, WARNING, DANGER];
  const max = data[0]?.probability || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, color: TEXT }}>{item.disease}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: colors[i] }}>{(item.probability * 100).toFixed(1)}%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: colors[i], width: go ? `${(item.probability/max)*100}%` : "0%", transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i*0.08}s`, boxShadow: `0 0 8px ${colors[i]}55` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const AnimBar = ({ pct, color, delay = 0 }) => {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200 + delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 4, background: color, width: go ? `${pct}%` : "0%", transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}ms`, boxShadow: `0 0 8px ${color}50` }} />
    </div>
  );
};

const Dots = () => (
  <div style={{ display: "flex", gap: 5 }}>
    {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: TEXT2, animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
  </div>
);

const Wave = ({ active }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 22 }}>
    {[0.45,0.75,1,0.88,0.6,0.92,0.5,0.7,0.4,0.65].map((h, i) => (
      <div key={i} style={{ width: 3, height: `${h*100}%`, borderRadius: 2, background: active ? DANGER : ACCENT, opacity: active ? 1 : 0.25, animation: active ? `waveBar ${0.55+i*0.09}s ease-in-out ${i*0.04}s infinite` : "none", transition: "background 0.3s, opacity 0.3s" }} />
    ))}
  </div>
);

export default function App() {
  const [tab, setTab] = useState("diagnose");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [symptoms, setSymptoms] = useState("");
  const [conditions, setConditions] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am your AI Medical Assistant. Ask me anything about diagnoses, medications, or symptoms.\n\nTry: 'What is dengue treatment?' or 'Explain diabetes management'" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selHistory, setSelHistory] = useState(null);
  const [histFilter, setHistFilter] = useState("All");
  const chatEnd = useRef(null);
  const recRef = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const diagnose = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const raw = await diagnosePatient(Number(age) || 30, symptoms, gender, conditions);

      // Normalize backend response — handle all possible shapes safely
      const treatment = raw?.treatment || {};
      const triage    = raw?.triage    || {};
      const safety    = raw?.drug_safety || {};
      const profile   = raw?.patient_profile || {};

      const normalized = {
        treatment: {
          predicted_disease:  treatment.predicted_disease  || raw?.primary_diagnosis?.disease || "Unknown",
          recommended_drug:   treatment.recommended_drug   || "Consult physician",
          dosage:             treatment.dosage             || "As prescribed",
          duration:           treatment.duration           || "As advised",
          explanation:        treatment.explanation        || "",
          lifestyle:          Array.isArray(treatment.lifestyle)  ? treatment.lifestyle  : [],
          warnings:           Array.isArray(treatment.warnings)   ? treatment.warnings   : [],
        },
        triage: {
          level:          triage.level          || "LOW",
          recommendation: triage.recommendation || "Monitor symptoms.",
          score:          typeof triage.score === "number" ? triage.score : 0,
        },
        drug_safety: {
          safety_level:      safety.safety_level      || "SAFE",
          risk_score:        safety.risk_score        ?? 0,
          clinical_warnings: Array.isArray(safety.clinical_warnings) ? safety.clinical_warnings : [],
        },
        patient_profile: {
          disease_probabilities: Array.isArray(profile.disease_probabilities) && profile.disease_probabilities.length > 0
            ? profile.disease_probabilities
            : [{ disease: treatment.predicted_disease || "Unknown", probability: 1 }],
        },
      };

      setResult(normalized);
    } catch (error) {
      console.error(error);
      alert("Backend connection failed. Check if FastAPI server is running.");
    }
    setLoading(false);
  };

  const voiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition requires Chrome browser."); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = "en-US";
    rec.onresult = e => { setSymptoms(e.results[0][0].transcript); setListening(false); };
    rec.onerror = rec.onend = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim(); setChatInput("");
    setMessages(p => [...p, { role: "user", text: msg }]);
    setChatLoading(true);
    await new Promise(r => setTimeout(r, 700 + Math.random()*700));
    setMessages(p => [...p, { role: "ai", text: aiChatKnowledge(msg) }]);
    setChatLoading(false);
  };

  const downloadReport = () => {
    if (!result) return;
    const d = result.treatment, t = result.triage, s = result.drug_safety;
    const content = [
      "AI CLINICAL DECISION SUPPORT REPORT",
      "=====================================",
      `Generated: ${new Date().toLocaleString()}`,
      `Case ID: ${Math.random().toString(36).substr(2,8).toUpperCase()}`,
      "",
      "PATIENT DETAILS",
      "---------------",
      `Age: ${age||"N/A"}  |  Gender: ${gender}`,
      `Symptoms: ${symptoms}`,
      `Pre-existing Conditions: ${conditions||"None"}`,
      "",
      "PRIMARY DIAGNOSIS",
      "-----------------",
      `Disease: ${d.predicted_disease}`,
      `Confidence: ${(result.patient_profile.disease_probabilities[0].probability*100).toFixed(1)}%`,
      "",
      "TRIAGE ASSESSMENT",
      "-----------------",
      `Level: ${t.level}  |  Score: ${t.score}/100`,
      `Recommendation: ${t.recommendation}`,
      "",
      "TREATMENT PLAN",
      "--------------",
      `Drug: ${d.recommended_drug}`,
      `Dosage: ${d.dosage}`,
      `Duration: ${d.duration}`,
      "",
      "LIFESTYLE MODIFICATIONS",
      "-----------------------",
      ...d.lifestyle.map(l => `  - ${l}`),
      "",
      "WARNINGS",
      "--------",
      ...d.warnings.map(w => `  ! ${w}`),
      "",
      "DRUG SAFETY",
      "-----------",
      `Safety Level: ${s.safety_level}  |  Risk Score: ${s.risk_score}`,
      ...s.clinical_warnings.map(w => `  - ${w}`),
      "",
      "DIFFERENTIAL DIAGNOSES",
      "----------------------",
      ...result.patient_profile.disease_probabilities.map((p,i) => `  ${i+1}. ${p.disease} - ${(p.probability*100).toFixed(1)}%`),
      "",
      "-------------------------------------------",
      "DISCLAIMER: AI-generated for clinical support only.",
      "Does not replace a licensed healthcare professional.",
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = `clinical-report-${Date.now()}.txt`; a.click();
  };

  const filteredHistory = histFilter === "All" ? patientHistory : patientHistory.filter(p => p.triage === histFilter);

  return (
    <>
      <style>{injectCSS}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <nav style={{ width: 210, padding: "22px 12px", display: "flex", flexDirection: "column", gap: 3, borderRight: `1px solid ${BORDER}`, position: "sticky", top: 0, height: "100vh", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "6px 12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 33, height: 33, borderRadius: 9, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>AI Clinic</div>
              <div style={{ fontSize: 10, color: TEXT3 }}>Clinical DSS v2.0</div>
            </div>
          </div>

          {[
            ["diagnose","🩺","Diagnose"],
            ["chat","💬","AI Chat"],
            ["history","📁","History"],
            ["analytics","📊","Analytics"],
          ].map(([id,icon,label]) => (
            <button key={id} className={`slink ${tab===id?"active":""}`} onClick={() => setTab(id)}>
              <span style={{ fontSize: 16 }}>{icon}</span>{label}
            </button>
          ))}

          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <div style={{ padding: "12px 13px", borderRadius: 12, background: "rgba(59,126,255,0.08)", border: "1px solid rgba(59,126,255,0.2)" }}>
              <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 7 }}>SYSTEM STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: SUCCESS, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11.5, color: TEXT2 }}>10 agents online</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "28px 26px" }}>

          {/* DIAGNOSE */}
          {tab === "diagnose" && (
            <div style={{ maxWidth: 1060, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>Clinical Diagnosis</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>AI-powered multi-agent medical decision support system</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Input panel */}
                <div className="glass" style={{ padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Patient Information</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>AGE</label>
                        <input className="field" placeholder="e.g. 35" type="number" value={age} onChange={e => setAge(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>GENDER</label>
                        <select className="field" value={gender} onChange={e => setGender(e.target.value)} style={{ cursor: "pointer" }}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>SYMPTOMS</label>
                      <div style={{ position: "relative" }}>
                        <textarea className="field" rows={4} placeholder="Describe symptoms... e.g. high fever with severe headache and rash for 3 days"
                          value={symptoms} onChange={e => setSymptoms(e.target.value)}
                          style={{ resize: "none", paddingRight: 50 }} />
                        <button onClick={voiceInput} title={listening ? "Stop" : "Voice input"}
                          style={{ position: "absolute", bottom: 10, right: 10, width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: listening ? DANGER : "rgba(255,255,255,0.08)", color: listening ? "white" : TEXT2, animation: listening ? "glow 1.5s infinite" : "none", transition: "all 0.2s" }}>
                          {listening
                            ? <div style={{ width: 9, height: 9, borderRadius: 2, background: "white" }} />
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                          }
                        </button>
                      </div>
                      {listening && (
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8, padding: "7px 11px", borderRadius: 8, background: "rgba(255,69,58,0.07)", border: "1px solid rgba(255,69,58,0.18)" }}>
                          <Wave active />
                          <span style={{ fontSize: 12, color: DANGER }}>Listening... speak your symptoms</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>PRE-EXISTING CONDITIONS <span style={{ opacity: 0.4 }}>(optional)</span></label>
                      <input className="field" placeholder="e.g. hypertension, kidney disease" value={conditions} onChange={e => setConditions(e.target.value)} />
                    </div>

                    <button className="btn btn-primary" onClick={diagnose} disabled={loading || !symptoms.trim()} style={{ marginTop: 2, height: 46 }}>
                      {loading
                        ? <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Analyzing...</>
                        : "🧠 Run AI Diagnosis"}
                    </button>
                  </div>
                </div>

                {/* Results panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {loading && (
                    <div className="glass" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                        <div style={{ width: 30, height: 30, border: `2px solid rgba(59,126,255,0.25)`, borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Running AI Agents...</div>
                          <div style={{ fontSize: 11.5, color: TEXT2 }}>Symptom extraction → Diagnosis → Drug matching → Risk</div>
                        </div>
                      </div>
                      {[75,55,85,65].map((w,i) => <div key={i} className="skeleton" style={{ height: 12, width: `${w}%` }} />)}
                    </div>
                  )}

                  {result && !loading && <>
                    <div className="glass" style={{ padding: 20, animation: "slideIn 0.4s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em", marginBottom: 4 }}>PRIMARY DIAGNOSIS</div>
                          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.3px" }}>{result.treatment.predicted_disease}</div>
                        </div>
                        <TriageBadge level={result.triage.level} />
                      </div>
                      <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{result.triage.recommendation}</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14 }}>
                      <div className="glass" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em", marginBottom: 12 }}>TREATMENT PLAN</div>
                        {[["DRUG", result.treatment.recommended_drug, ACCENT],["DOSAGE", result.treatment.dosage, TEXT],["DURATION", result.treatment.duration, TEXT]].map(([k,v,c]) => (
                          <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: k!=="DURATION" ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
                            <span style={{ fontSize: 10, color: TEXT3, minWidth: 58, letterSpacing: "0.04em" }}>{k}</span>
                            <span style={{ fontSize: 13.5, fontWeight: k==="DRUG"?700:500, color: c }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="glass" style={{ padding: 16, display: "flex", alignItems: "center" }}>
                        <Gauge score={result.triage.score} />
                      </div>
                    </div>

                    <div className="glass" style={{ padding: 20, animation: "slideIn 0.4s ease 0.1s both" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Differential Diagnosis Probabilities</span>
                      </div>
                      <ProbChart data={result.patient_profile.disease_probabilities} />
                    </div>

                    {result.treatment.warnings?.length > 0 && (
                      <div className="glass" style={{ padding: 18, borderColor: "rgba(255,69,58,0.22)", background: "rgba(255,69,58,0.03)", animation: "slideIn 0.4s ease 0.2s both" }}>
                        <div style={{ fontSize: 11, color: DANGER, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 9 }}>CLINICAL WARNINGS</div>
                        {result.treatment.warnings?.map((w,i) => (
                          <div key={i} style={{ fontSize: 12.5, color: TEXT2, padding: "5px 0", borderBottom: i<(result.treatment.warnings.length-1)?`1px solid rgba(255,255,255,0.04)`:"none" }}>⚠️ {w}</div>
                        ))}
                      </div>
                    )}

                    <button className="btn btn-ghost" onClick={downloadReport} style={{ justifyContent: "center", width: "100%", animation: "slideIn 0.4s ease 0.3s both" }}>
                      📄 Download Clinical Report (.txt)
                    </button>
                  </>}

                  {!result && !loading && (
                    <div className="glass" style={{ padding: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 190 }}>
                      <div style={{ fontSize: 38 }}>🩺</div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: TEXT2 }}>Enter patient details to begin</div>
                      <div style={{ fontSize: 12.5, color: TEXT3, textAlign: "center" }}>10+ specialized AI agents will analyze the symptoms</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lifestyle + Safety */}
              {result && !loading && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18, animation: "fadeUp 0.5s ease 0.2s both" }}>
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 13 }}>🌿 Lifestyle Recommendations</div>
                    {result.treatment.lifestyle?.map((l,i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: SUCCESS, marginTop: 5.5, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.5 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 13 }}>🛡️ Drug Safety Assessment</div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                      <span style={{ fontSize: 13, color: TEXT2 }}>Safety Level</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: result.drug_safety.safety_level==="SAFE"?"rgba(48,209,88,0.1)":"rgba(255,214,10,0.1)", color: result.drug_safety.safety_level==="SAFE"?SUCCESS:WARNING }}>{result.drug_safety.safety_level}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                      <span style={{ fontSize: 13, color: TEXT2 }}>Risk Score</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{result.drug_safety.risk_score}/100</span>
                    </div>
                    {result.drug_safety.clinical_warnings?.length === 0
                      ? <div style={{ marginTop: 8, fontSize: 12, color: SUCCESS, padding: "6px 10px", borderRadius: 8, background: "rgba(48,209,88,0.06)", border: "1px solid rgba(48,209,88,0.15)" }}>✅ No contraindications detected</div>
                      : result.drug_safety.clinical_warnings.map((w,i) => <div key={i} style={{ marginTop: 6, fontSize: 12, color: WARNING, padding: "6px 10px", borderRadius: 8, background: "rgba(255,214,10,0.06)", border: "1px solid rgba(255,214,10,0.14)" }}>⚠️ {w}</div>)
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAT */}
          {tab === "chat" && (
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 18 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>AI Medical Chat</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>Clinical knowledge assistant powered by medical AI</p>
              </div>

              <div className="glass" style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", marginBottom: 14 }}>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "chat-user" : "chat-ai"}>
                    {m.role === "ai" && (
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🧠</div>
                    )}
                    <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-ai">
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🧠</div>
                    <div className="bubble-ai"><Dots /></div>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>

              <div style={{ display: "flex", gap: 9 }}>
                <input className="field" placeholder="Ask about any disease, medication, or symptom..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={sendChat} disabled={!chatInput.trim()||chatLoading} style={{ width: 46, height: 46, padding: 0, borderRadius: 12, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
                {["Dengue treatment?","Diabetes management","Asthma medications","Hypertension lifestyle","What is pneumonia?"].map(q => (
                  <button key={q} className="btn btn-ghost" style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 20 }} onClick={() => setChatInput(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div style={{ maxWidth: 860, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>Patient History</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>Recent consultations and clinical records</p>
              </div>

              <div className="glass" style={{ overflow: "hidden", marginBottom: 14 }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{filteredHistory.length} Records</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["All","HIGH","MODERATE","LOW"].map(f => (
                      <button key={f} className={`ntab ${histFilter===f?"on":""}`} onClick={() => setHistFilter(f)}>{f}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  {filteredHistory.map((p, i) => (
                    <div key={p.id} className="histrow" onClick={() => setSelHistory(selHistory?.id===p.id ? null : p)} style={{ animation: `fadeUp 0.3s ease ${i*0.05}s both` }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(59,126,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                        {p.triage==="HIGH"?"🚨":p.triage==="MODERATE"?"⚠️":"✅"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: TEXT2 }}>Age {p.age} · {p.date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{p.disease}</div>
                        <TriageBadge level={p.triage} />
                      </div>
                    </div>
                  ))}
                  {filteredHistory.length === 0 && (
                    <div style={{ padding: "24px", textAlign: "center", color: TEXT3, fontSize: 14 }}>No records for this filter</div>
                  )}
                </div>
              </div>

              {selHistory && (
                <div className="glass" style={{ padding: 20, animation: "slideIn 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>{selHistory.name}</div>
                      <div style={{ fontSize: 12.5, color: TEXT2, marginTop: 2 }}>Age {selHistory.age} · {selHistory.date}</div>
                    </div>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setSelHistory(null)}>Close ✕</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, marginBottom: 14 }}>
                    {[["Diagnosis",selHistory.disease],["Treatment",selHistory.drug],["Triage",<TriageBadge key="tb" level={selHistory.triage} />]].map(([l,v],i) => (
                      <div key={i} style={{ padding: "14px 16px", borderRadius: 13, background: SURFACE, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 10.5, color: TEXT3, letterSpacing: "0.04em", marginBottom: 7 }}>{l}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "13px 15px", borderRadius: 11, background: SURFACE, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 10.5, color: TEXT3, letterSpacing: "0.04em", marginBottom: 5 }}>SYMPTOMS</div>
                    <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{selHistory.symptoms}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {tab === "analytics" && (
            <div style={{ maxWidth: 980, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>Analytics</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>System performance and diagnosis distribution overview</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13, marginBottom: 18 }}>
                {[
                  ["247","Total Consultations","🩺","+12% this week"],
                  ["38","High Risk Cases","🚨","+3% this week"],
                  ["84.2%","Avg Confidence","🎯","+2.1% this week"],
                  ["10/10","Agents Active","🤖","100% uptime"],
                ].map(([v,l,ic,t],i) => (
                  <div key={i} className="glass" style={{ padding: 18, animation: `fadeUp 0.3s ease ${i*0.07}s both` }}>
                    <div style={{ fontSize: 22 }}>{ic}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", margin: "8px 0 3px" }}>{v}</div>
                    <div style={{ fontSize: 12, color: TEXT2 }}>{l}</div>
                    <div style={{ fontSize: 11, color: SUCCESS, marginTop: 4 }}>↑ {t}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                <div className="glass" style={{ padding: 22 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 17 }}>Disease Distribution</div>
                  {analyticsData.diseases.map((item, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12.5, color: TEXT }}>{item.disease}</span>
                        <span style={{ fontSize: 12.5, color: TEXT2 }}>{item.count} cases</span>
                      </div>
                      <AnimBar pct={(item.count/68)*100} color={item.color} delay={i*80} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 14 }}>Triage Distribution</div>
                    {analyticsData.triage.map((t,i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.color }} />
                            <span style={{ fontSize: 12.5, color: TEXT2 }}>{t.level}</span>
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: t.color }}>{t.pct}%</span>
                        </div>
                        <AnimBar pct={t.pct} color={t.color} delay={i*100} />
                      </div>
                    ))}
                  </div>

                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 13 }}>Agent Performance</div>
                    {analyticsData.agents.map((a,i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i<analyticsData.agents.length-1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                        <span style={{ fontSize: 12.5, color: TEXT2 }}>{a.name}</span>
                        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: TEXT3 }}>{a.latency}</span>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: SUCCESS, animation: "pulse 2s infinite" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
