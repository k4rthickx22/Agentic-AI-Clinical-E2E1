"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { diagnosePatient, fetchHistory, fetchAnalytics, sendChatMessage, getDiagnosisExplanation, getStoredUser, logout } from "@/services/api";
import { t, languages } from "@/lib/i18n";



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



const injectCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{background:radial-gradient(circle at 50% 0%, #1a2342 0%, #060912 60%);background-attachment:fixed;color:${TEXT};font-family:-apple-system,'SF Pro Display','Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
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
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;-webkit-tap-highlight-color:transparent}
.btn-primary{background:${ACCENT};color:white;padding:12px 22px}
.btn-primary:hover{background:#2d6fe8;transform:translateY(-1px);box-shadow:0 8px 24px rgba(59,126,255,0.4)}
.btn-primary:disabled{opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{background:${SURFACE};border:1px solid ${BORDER};color:${TEXT2};padding:9px 16px}
.btn-ghost:hover{background:rgba(255,255,255,0.07);color:${TEXT};border-color:rgba(255,255,255,0.14)}
.field{width:100%;background:rgba(255,255,255,0.05);border:1px solid ${BORDER};border-radius:12px;padding:12px 15px;color:${TEXT};font-size:14px;outline:none;transition:all 0.2s;font-family:inherit}
.field::placeholder{color:${TEXT3}}
.field:focus{border-color:${ACCENT};box-shadow:0 0 0 3px rgba(59,126,255,0.12)}
.slink{display:flex;align-items:center;gap:11px;padding:9px 13px;border-radius:10px;color:${TEXT2};font-size:14px;font-weight:500;cursor:pointer;transition:all 0.18s;background:transparent;border:none;width:100%;font-family:inherit;-webkit-tap-highlight-color:transparent}
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

/* ── App shell layout ─────────────────────────────────────── */
.app-shell{display:flex;min-height:100vh;position:relative}
.app-sidebar{width:210px;padding:22px 12px;display:flex;flex-direction:column;gap:3px;border-right:1px solid ${BORDER};position:sticky;top:0;height:100vh;flex-shrink:0;overflow-y:auto;background:${BG};transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);z-index:200}
.app-content{flex:1;overflow:auto;padding:28px 26px;min-width:0}
.mobile-topbar{display:none;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid ${BORDER};background:rgba(6,9,18,0.95);backdrop-filter:blur(16px);position:sticky;top:0;z-index:100}
.sidebar-backdrop{display:none;position:fixed;inset:0;z-index:190;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px)}
.hamburger-btn{display:flex;flex-direction:column;gap:5px;background:transparent;border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;padding:8px 10px;-webkit-tap-highlight-color:transparent}
.hamburger-btn span{display:block;width:18px;height:2px;background:${TEXT};border-radius:2px;transition:all 0.2s}
.close-sidebar-btn{display:none}

/* ── Mobile breakpoint ────────────────────────────────────── */
@media(max-width:768px){
  .app-shell{flex-direction:column}
  .mobile-topbar{display:flex}
  .app-sidebar{position:fixed;top:0;left:0;height:100vh;transform:translateX(-110%)}
  .app-sidebar.open{transform:translateX(0)}
  .sidebar-backdrop.open{display:block}
  .app-content{padding:14px 14px}
  .close-sidebar-btn{display:flex;align-items:center;gap:6px;margin-left:auto;margin-bottom:10px;padding:5px 11px;background:rgba(255,255,255,0.06);border:none;border-radius:8px;cursor:pointer;color:${TEXT2};font-size:13px;font-family:inherit;-webkit-tap-highlight-color:transparent}
  .bubble-user{max-width:90%}
  .bubble-ai{max-width:94%}
  .field{font-size:16px}
  .slink{font-size:15px;padding:12px 13px;min-height:48px}
  .btn{min-height:44px}
  .glass{border-radius:14px}
  /* Diagnose tab grid overrides */
  .diagnose-cols{grid-template-columns:1fr !important}
  .patient-info-grid{grid-template-columns:1fr !important}
  .pair-grid{grid-template-columns:1fr !important}
  .result-pair{grid-template-columns:1fr !important}
  .two-col{grid-template-columns:1fr !important}
  /* Chat tab */
  .chat-height{height:calc(100vh - 180px) !important}
}
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

// ── Structured AI chat message renderer ─────────────────────────────
const ChatMessage = ({ content }) => {
  const lines = content.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {lines.map((line, i) => {
        // Blank line → spacer
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />;

        // Bullet lines starting with • or -
        const isBullet = line.startsWith("•") || line.startsWith("-") || line.match(/^\d+\./);
        // Section header: line ends with ':'
        const isHeader = line.trim().endsWith(":") && line.trim().length < 60 && !isBullet;

        // Render inline **bold** segments
        const renderBold = (text) => {
          const parts = text.split(/\*\*(.*?)\*\*/g);
          return parts.map((p, j) =>
            j % 2 === 1
              ? <strong key={j} style={{ color: "#f2f2f7", fontWeight: 700 }}>{p}</strong>
              : <span key={j}>{p}</span>
          );
        };

        if (isHeader) return (
          <div key={i} style={{ fontSize: 12, fontWeight: 700, color: "#3b7eff", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: i > 0 ? 6 : 0 }}>
            {renderBold(line.replace(/:$/, ""))}
          </div>
        );

        if (isBullet) return (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#3b7eff", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>•</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.6 }}>{renderBold(line.replace(/^[•\-]\s*/, "").replace(/^\d+\.\s*/, ""))}</span>
          </div>
        );

        return (
          <p key={i} style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{renderBold(line)}</p>
        );
      })}
    </div>
  );
};

// ── Inner component that uses useSearchParams (must be inside Suspense) ──
function AppInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const VALID_TABS = ["diagnose", "chat", "history", "analytics"];
  const VALID_LANGS = ["en", "ta", "hi"];

  const [tab, setTabState] = useState("diagnose");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLangState] = useState("en");
  const [currentUser, setCurrentUser] = useState(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const [speakingField, setSpeakingField] = useState(null);

  // ── Helpers: change tab/lang and update URL ──────────────────
  const setTab = (newTab) => {
    setTabState(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    router.replace(`/clinic?${params.toString()}`, { scroll: false });
  };

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", newLang);
    router.replace(`/clinic?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    // Read tab and lang from URL on mount (enables refresh to restore state)
    const urlTab = searchParams.get("tab");
    const urlLang = searchParams.get("lang");
    if (urlTab && VALID_TABS.includes(urlTab)) setTabState(urlTab);
    if (urlLang && VALID_LANGS.includes(urlLang)) {
      setLangState(urlLang);
      localStorage.setItem("lang", urlLang);
    } else {
      // Fallback: read from localStorage, then default to 'en'
      const saved = localStorage.getItem("lang");
      if (saved && VALID_LANGS.includes(saved)) setLangState(saved);
    }
    setCurrentUser(getStoredUser());
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/health`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setBackendOnline(d.status === "ok"))
      .catch(() => setBackendOnline(false));
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // ────────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [symptoms, setSymptoms] = useState("");
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [chatListening, setChatListening] = useState(false);
  const [aiExplain, setAiExplain] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [groqFallback, setGroqFallback] = useState(false); // whether Grok fallback was used

  const [patientHistory, setPatientHistory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm your AI Medical Assistant 🩺\n\nI can help you with:\n• **Disease information** and symptoms\n• **Medication** guidance and dosages\n• **Lifestyle** recommendations\n• **Emergency** triage advice\n\nWhat would you like to know today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selHistory, setSelHistory] = useState(null);
  const [histFilter, setHistFilter] = useState("All");
  const chatEnd = useRef(null);
  const recRef = useRef(null);
  const chatRecRef = useRef(null);
  const silenceTimerRef = useRef(null);      // auto-stops diagnosis mic after 2.5 s silence
  const chatSilenceTimerRef = useRef(null);  // auto-stops chat mic after 2.5 s silence
  const voicesRef = useRef([]);              // pre-loaded TTS voices (avoid empty getVoices())
  const currentAudioRef = useRef(null);      // HTML5 Audio element for Tamil backend TTS
  // Refs to hold transcript without triggering re-renders mid-speech
  const diagTranscriptRef = useRef("");
  const chatTranscriptRef = useRef("");


  // Pre-load TTS voices as soon as speechSynthesis is ready
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetchHistory().then(setPatientHistory).catch(console.error);
    fetchAnalytics().then(setAnalyticsData).catch(console.error);
  }, []);

  // symptomOverride: pass captured voice text directly to avoid stale-closure bug.
  // NOTE: always call as diagnose() or diagnose(string) — never as an onClick handler directly
  // (React would pass SyntheticEvent as first arg). Use onClick={() => diagnose()} instead.
  const diagnose = async (symptomOverride = null) => {
    // Only treat override as symptoms if it's actually a string (guards against SyntheticEvent)
    const effectiveSymptoms = typeof symptomOverride === "string" ? symptomOverride : symptoms;
    if (!effectiveSymptoms?.trim()) return;
    setLoading(true);
    setResult(null);
    setGroqFallback(false);
    try {
      const raw = await diagnosePatient(Number(age) || 30, effectiveSymptoms, gender, conditions, name || "Anonymous", allergies || "none");

      // Normalize backend response — handle all possible shapes safely
      const treatment = raw?.treatment || {};
      const triage    = raw?.triage    || {};
      const safety    = raw?.drug_safety || {};
      const profile   = raw?.patient_profile || {};
      const mlConfidence = typeof raw?.confidence_score === "number" ? raw.confidence_score : 1.0;

      const normalized = {
        treatment: {
          predicted_disease:  treatment.predicted_disease  || raw?.primary_diagnosis?.disease || "Unknown",
          recommended_drug:   treatment.recommended_drug   || "Consult physician",
          dosage:             treatment.dosage             || "As prescribed",
          duration:           treatment.duration           || "As advised",
          explanation:        treatment.explanation        || "",
          lifestyle:          Array.isArray(treatment.lifestyle)  ? treatment.lifestyle  : [],
          warnings:           Array.isArray(treatment.warnings)   ? treatment.warnings   : [],
          treatment_plan:     Array.isArray(treatment.treatment_plan) ? treatment.treatment_plan : [],
          when_to_seek_care:  treatment.when_to_seek_care || "",
        },
        triage: {
          level:          triage.level          || "LOW",
          recommendation: triage.recommendation || "Monitor symptoms.",
          score:          typeof triage.score === "number" ? triage.score : 0,
          reasons:        Array.isArray(triage.reasons) ? triage.reasons : [],
        },
        drug_safety: {
          safety_level:      safety.safety_level      || "SAFE",
          risk_score:        safety.risk_score        ?? 0,
          clinical_warnings: Array.isArray(safety.clinical_warnings) ? safety.clinical_warnings : [],
        },
        drug_interactions:  Array.isArray(raw?.drug_interactions) ? raw.drug_interactions : [],
        reasoning_trace:    Array.isArray(raw?.reasoning_trace) ? raw.reasoning_trace : [],
        follow_up_questions: Array.isArray(raw?.follow_up_questions) ? raw.follow_up_questions : [],
        patient_profile: {
          disease_probabilities: Array.isArray(profile.disease_probabilities) && profile.disease_probabilities.length > 0
            ? profile.disease_probabilities
            : [{ disease: treatment.predicted_disease || "Unknown", probability: 1 }],
        },
        confidence_score: mlConfidence,
      };

      // ── Grok Fallback: activate when ML confidence < 35% OR key treatment fields are empty ──
      const CONFIDENCE_THRESHOLD = 0.35;
      const missingTreatmentData =
        normalized.treatment.recommended_drug === "Consult physician" ||
        normalized.treatment.treatment_plan.length === 0 ||
        normalized.treatment.lifestyle.length === 0;

      if (mlConfidence < CONFIDENCE_THRESHOLD || missingTreatmentData) {
        console.log(`[GrokFallback] Triggering — confidence: ${(mlConfidence*100).toFixed(1)}%, missingData: ${missingTreatmentData}`);
        try {
          const fbRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/diagnose/groq-fallback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              symptoms: effectiveSymptoms,
              age: Number(age) || 30,
              gender,
              conditions: conditions || "none",
              allergies: allergies || "none",
              language: lang
            })
          });
          const fb = await fbRes.json();
          if (fb.activated) {
            // Merge Grok result into treatment
            normalized.treatment.predicted_disease = fb.disease || normalized.treatment.predicted_disease;
            normalized.treatment.recommended_drug  = fb.drug    || normalized.treatment.recommended_drug;
            normalized.treatment.dosage            = fb.dosage  || normalized.treatment.dosage;
            normalized.treatment.duration          = fb.duration || normalized.treatment.duration;
            normalized.treatment.explanation       = fb.explanation || normalized.treatment.explanation;
            if (Array.isArray(fb.treatment_plan) && fb.treatment_plan.length) normalized.treatment.treatment_plan = fb.treatment_plan;
            if (Array.isArray(fb.lifestyle) && fb.lifestyle.length) normalized.treatment.lifestyle = fb.lifestyle;
            if (Array.isArray(fb.warnings) && fb.warnings.length) normalized.treatment.warnings = fb.warnings;
            if (fb.when_to_seek_care) normalized.treatment.when_to_seek_care = fb.when_to_seek_care;
            setGroqFallback(true);
            console.log(`[GrokFallback] ✅ Grok diagnosed: ${fb.disease}`);
          }
        } catch (fbErr) {
          console.warn("[GrokFallback] Grok API call failed:", fbErr);
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      setResult(normalized);

      // Refresh history & analytics in background
      fetchHistory().then(setPatientHistory).catch(console.error);
      fetchAnalytics().then(setAnalyticsData).catch(console.error);

      // Auto-trigger AI Doctor's Analysis (use potentially-updated disease from Grok)
      const disease = normalized.treatment.predicted_disease;
      if (disease && disease !== "Unknown") {
        setAiExplain(null);
        setExplainLoading(true);
        getDiagnosisExplanation(
          disease,
          effectiveSymptoms,
          Number(age) || 30,
          gender,
          conditions || "none",
          allergies || "none",
          lang
        ).then(exp => {
          setAiExplain(exp);
          setExplainLoading(false);
        }).catch(err => {
          console.error("Explain API error:", err);
          setExplainLoading(false);
        });
      }

    } catch (error) {
      console.error(error);
      alert("Backend connection failed. Check if FastAPI server is running.");
    }
    setLoading(false);
  };

  const regenerateExplain = () => {
    if (!result) return;
    const disease = result.treatment.predicted_disease;
    if (!disease || disease === "Unknown") return;
    setAiExplain(null);
    setExplainLoading(true);
    getDiagnosisExplanation(
      disease, symptoms, Number(age) || 30, gender,
      conditions || "none", allergies || "none", lang
    ).then(exp => {
      setAiExplain(exp);
      setExplainLoading(false);
    }).catch(() => setExplainLoading(false));
  };


  // ── Voice recognition – shared lang codes ───────────────────
  const LANG_CODES = { en: "en-US", ta: "ta-IN", hi: "hi-IN" };

  // ── Diagnosis voice ──────────────────────────────────────────
  // Tamil uses non-continuous mode (restart-on-end) for mobile compatibility.
  // Other languages use continuous mode with 2.5 s silence auto-stop.
  const toggleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported. Please use Chrome or Edge."); return; }
    if (listening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recRef.current?.stop();
      recRef.current = null;
      setListening(false);
      return;
    }
    diagTranscriptRef.current = "";
    const isTamil = lang === "ta";
    let shouldRestart = true; // used for Tamil restart loop

    const startRec = () => {
      const rec = new SR();
      rec.continuous = !isTamil; // Tamil: non-continuous (mobile fix)
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = LANG_CODES[lang] || "en-US";
      rec.onresult = e => {
        let full = "";
        for (let i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript + (e.results[i].isFinal ? " " : "");
        }
        const combined = (diagTranscriptRef.current + " " + full).trim();
        diagTranscriptRef.current = combined;
        setSymptoms(combined);
        if (!isTamil) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => { recRef.current?.stop(); }, 2500);
        }
      };
      rec.onend = () => {
        if (isTamil) {
          // Tamil: restart unless user clicked stop
          if (shouldRestart && recRef.current !== null) {
            try { const r2 = startRec(); recRef.current = r2; } catch(_) {}
          } else {
            setListening(false);
            const captured = diagTranscriptRef.current.trim();
            if (captured) { setSymptoms(captured); setTimeout(() => diagnose(captured), 300); }
          }
        } else {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setListening(false);
          const captured = diagTranscriptRef.current.trim();
          if (captured) { setSymptoms(captured); setTimeout(() => diagnose(captured), 300); }
        }
      };
      rec.onerror = (e) => {
        if (e.error === "no-speech" && isTamil && shouldRestart && recRef.current !== null) {
          // Restart on no-speech for Tamil
          try { const r2 = startRec(); recRef.current = r2; } catch(_) {}
          return;
        }
        if (e.error !== "no-speech") {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          shouldRestart = false;
          setListening(false);
        }
      };
      rec.start();
      return rec;
    };

    shouldRestart = true;
    const rec = startRec();
    recRef.current = rec;
    setListening(true);
  };

  // ── Chat voice: non-continuous restart for Tamil, silence-stop for others ──
  const toggleChatListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported. Please use Chrome or Edge."); return; }
    if (chatListening) {
      if (chatSilenceTimerRef.current) clearTimeout(chatSilenceTimerRef.current);
      chatRecRef.current?.stop();
      chatRecRef.current = null;
      setChatListening(false);
      return;
    }
    chatTranscriptRef.current = "";
    const isTamil = lang === "ta";
    let shouldRestartChat = true;

    const startChatRec = () => {
      const rec = new SR();
      rec.continuous = !isTamil;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = LANG_CODES[lang] || "en-US";
      rec.onresult = e => {
        let full = "";
        for (let i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript + (e.results[i].isFinal ? " " : "");
        }
        const combined = (chatTranscriptRef.current + " " + full).trim();
        chatTranscriptRef.current = combined;
        setChatInput(combined);
        if (!isTamil) {
          if (chatSilenceTimerRef.current) clearTimeout(chatSilenceTimerRef.current);
          chatSilenceTimerRef.current = setTimeout(() => { chatRecRef.current?.stop(); }, 2500);
        }
      };
      rec.onend = () => {
        if (isTamil) {
          if (shouldRestartChat && chatRecRef.current !== null) {
            try { const r2 = startChatRec(); chatRecRef.current = r2; } catch(_) {}
          } else {
            setChatListening(false);
            const captured = chatTranscriptRef.current.trim();
            if (captured) { setChatInput(""); chatTranscriptRef.current = ""; setTimeout(() => sendChatWithMsg(captured), 200); }
          }
        } else {
          if (chatSilenceTimerRef.current) clearTimeout(chatSilenceTimerRef.current);
          setChatListening(false);
          const captured = chatTranscriptRef.current.trim();
          if (captured) { setChatInput(""); chatTranscriptRef.current = ""; setTimeout(() => sendChatWithMsg(captured), 200); }
        }
      };
      rec.onerror = (e) => {
        if (e.error === "no-speech" && isTamil && shouldRestartChat && chatRecRef.current !== null) {
          try { const r2 = startChatRec(); chatRecRef.current = r2; } catch(_) {}
          return;
        }
        if (e.error !== "no-speech") {
          if (chatSilenceTimerRef.current) clearTimeout(chatSilenceTimerRef.current);
          shouldRestartChat = false;
          setChatListening(false);
        }
      };
      rec.start();
      return rec;
    };

    shouldRestartChat = true;
    const rec = startChatRec();
    chatRecRef.current = rec;
    setChatListening(true);
  };

  // ── Text-to-Speech ───────────────────────────────────────────────────
  // Tamil → backend proxy (Google Translate TTS, returns real MP3)
  // English/Hindi → Web Speech API (has pre-installed Windows voices)
  const speakText = (text, fieldId = "chat") => {
    // Stop any existing playback
    window.speechSynthesis?.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (speakingField === fieldId) { setSpeakingField(null); return; } // toggle off

    const clean = text
      .replace(/[\u{1F600}-\u{1FFFF}]/gu, "")
      .replace(/[\u2700-\u27BF]/gu, "")
      .replace(/[\u2600-\u26FF]/gu, "")
      .replace(/[\u2300-\u23FF]/gu, "")
      .trim();
    if (!clean) return;

    // ── Tamil: use backend proxy ──────────────────────────────
    if (lang === "ta") {
      setSpeakingField(fieldId);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean, lang: "ta" })
      })
        .then(res => {
          if (!res.ok) throw new Error(`TTS error ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          currentAudioRef.current = audio;
          audio.onended = () => { URL.revokeObjectURL(url); setSpeakingField(null); currentAudioRef.current = null; };
          audio.onerror = () => { URL.revokeObjectURL(url); setSpeakingField(null); currentAudioRef.current = null; };
          audio.play();
        })
        .catch(err => {
          console.error("[TTS Tamil] Backend error:", err);
          setSpeakingField(null);
        });
      return;
    }

    // ── English / Hindi: Web Speech API ────────────────────────
    if (!window.speechSynthesis) return;
    const voiceLang = { en: "en-US", hi: "hi-IN" }[lang] || "en-US";
    const voicePrefs = {
      en: ["Microsoft Zira - English (United States)", "Microsoft Hazel - English (Great Britain)",
           "Google UK English Female", "Microsoft Aria Online (Natural) - English (United States)",
           "Microsoft Jenny Online (Natural) - English (United States)",
           "Samantha", "Karen", "Victoria"],
      hi: ["Microsoft Kalpana - Hindi (India)", "Microsoft Heera - Hindi (India)",
           "Google \u0939\u093f\u0928\u094d\u0926\u0940", "Google Hindi"],
    };
    const prefs = voicePrefs[lang] || voicePrefs.en;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > voicesRef.current.length) voicesRef.current = voices;
    const all = voicesRef.current;
    let voice = null;
    for (const n of prefs) { const v = all.find(v => v.name === n); if (v) { voice = v; break; } }
    if (!voice) voice = all.find(v => v.lang.startsWith(voiceLang.split("-")[0]) && v.name.toLowerCase().includes("female"));
    if (!voice) voice = all.find(v => v.lang.startsWith(voiceLang.split("-")[0]));

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = voiceLang;
    utter.rate = lang === "hi" ? 0.88 : 0.88;
    utter.pitch = 1.2;
    utter.volume = 1.0;
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeakingField(fieldId);
    utter.onend = () => setSpeakingField(null);
    utter.onerror = (e) => { console.warn("[TTS] Error:", e.error); setSpeakingField(null); };
    window.speechSynthesis.speak(utter);
  };


  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    setSpeakingField(null);
  };

  // Reusable TTS button component (inline)
  const TTSButton = ({ text, fieldId, style = {} }) => {
    const isActive = speakingField === fieldId;
    return (
      <button
        onClick={() => speakText(text, fieldId)}
        title={isActive ? "Stop reading" : "Read aloud"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 9px", borderRadius: 8, border: `1px solid ${isActive ? "rgba(255,69,58,0.35)" : "rgba(255,255,255,0.1)"}`,
          background: isActive ? "rgba(255,69,58,0.08)" : "rgba(255,255,255,0.04)",
          color: isActive ? DANGER : TEXT3, fontSize: 11.5, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", flexShrink: 0,
          ...style
        }}
      >
        {isActive ? "⏹ Stop" : "🔊 Listen"}
      </button>
    );
  };

  const sendChatWithMsg = async (msg) => {
    if (!msg || chatLoading) return;
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setChatLoading(true);
    try {
      const chatHistoryForAPI = newMessages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const diagCtx = result ? {
        disease: result.treatment.predicted_disease,
        drug: result.treatment.recommended_drug,
        triage: result.triage.level,
        symptoms: symptoms
      } : {};
      const { reply } = await sendChatMessage(msg, chatHistoryForAPI.slice(0, -1), lang, diagCtx);
      setMessages(p => [...p, { role: "ai", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(p => [...p, { role: "ai", content: "Sorry, I'm having trouble connecting to the AI server right now. Please try again." }]);
    }
    setChatLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim(); setChatInput("");
    await sendChatWithMsg(msg);
  };

  // ── Comprehensive client-side PDF generation ──────────────────────
  const downloadReport = async () => {
    if (!result) return;
    try {
      // Dynamic import to avoid SSR issues
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const W = doc.internal.pageSize.getWidth();
      const d = result.treatment;
      const tri = result.triage;
      const ds = result.drug_safety;
      const date = new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });

      // Header banner
      doc.setFillColor(15, 30, 70);
      doc.rect(0, 0, W, 36, "F");
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
      doc.text("myDoctor", 14, 14);
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 200, 255);
      doc.text("AI-Powered Clinical Diagnosis Report", 14, 21);
      doc.setFontSize(8); doc.setTextColor(140, 160, 220);
      doc.text(date, 14, 28);
      // Triage badge
      const triColor = tri.level === "HIGH" ? [200, 40, 40] : tri.level === "MODERATE" ? [180, 140, 0] : [30, 160, 80];
      doc.setFillColor(...triColor);
      doc.roundedRect(W - 45, 8, 32, 12, 2, 2, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
      doc.text(tri.level + " RISK", W - 29, 16, { align: "center" });

      let y = 44;
      const section = (title, color = [59, 126, 255]) => {
        if (y > 260) { doc.addPage(); y = 16; }
        doc.setFillColor(...color); doc.setTextColor(...color);
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(title.toUpperCase(), 14, y); y += 2;
        doc.setDrawColor(...color); doc.setLineWidth(0.4);
        doc.line(14, y, W - 14, y); y += 6;
        doc.setTextColor(30, 30, 30);
      };
      // ── Load Unicode font for Tamil/Hindi ─────────────────────────────
      // Noto Sans fonts support Tamil (U+0B80-0BFF) and Devanagari (U+0900-097F)
      let unicodeFontName = "helvetica";
      if (lang === "ta" || lang === "hi") {
        try {
          const fontFile = lang === "ta" ? "/NotoSansTamil-Regular.ttf" : "/NotoSansDevanagari-Regular.ttf";
          const fontKey = lang === "ta" ? "NotoSansTamil" : "NotoSansDevanagari";
          const fontRes = await fetch(fontFile);
          if (fontRes.ok) {
            const fontBuffer = await fontRes.arrayBuffer();
            const fontUint8 = new Uint8Array(fontBuffer);
            let binary = "";
            for (let i = 0; i < fontUint8.length; i++) binary += String.fromCharCode(fontUint8[i]);
            const fontB64 = btoa(binary);
            doc.addFileToVFS(`${fontKey}.ttf`, fontB64);
            doc.addFont(`${fontKey}.ttf`, fontKey, "normal");
            unicodeFontName = fontKey;
          }
        } catch (e) { console.warn("Font load failed, using helvetica:", e); }
      }

      // ── Text cleaner: fix HTML entities and special chars ─────────────
      const norm = (s) => {
        if (s === null || s === undefined) return "N/A";
        return String(s)
          .replace(/\u2019|\u2018/g, "'")
          .replace(/\u201C|\u201D/g, '"')
          .replace(/\u2022/g, "-")
          .replace(/\u2013/g, "-")
          .replace(/\u2014/g, "--")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim() || "N/A";
      };

      // ── font helpers ──────────────────────────────────────────────────
      const setLatinFont = (style = "normal") => doc.setFont("helvetica", style);
      const setContentFont = () => doc.setFont(unicodeFontName, "normal");

      const row = (label, value, indent = 14) => {
        if (y > 270) { doc.addPage(); y = 16; }
        setLatinFont("bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 120);
        doc.text(String(label) + ":", indent, y);
        setContentFont(); doc.setFontSize(9); doc.setTextColor(20, 20, 20);
        const vlines = doc.splitTextToSize(norm(value), W - indent - 60);
        doc.text(vlines, indent + 55, y);
        y += vlines.length * 5.5 + 2;
      };
      const para = (text, indent = 14) => {
        if (y > 270) { doc.addPage(); y = 16; }
        const safeText = norm(text);
        if (!safeText || safeText === "N/A") { y += 2; return; }
        setContentFont(); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
        const plines = doc.splitTextToSize(safeText, W - indent - 14);
        plines.forEach(l => { if (y > 270) { doc.addPage(); y = 16; } doc.text(l, indent, y); y += 5.5; });
        y += 3;
      };

      // Language indicator banner (only for non-English)
      if (lang === "ta" || lang === "hi") {
        doc.setFillColor(235, 245, 255);
        doc.roundedRect(14, y - 2, W - 28, 12, 2, 2, "F");
        setLatinFont("italic"); doc.setFontSize(8); doc.setTextColor(60, 80, 160);
        doc.text(lang === "ta" ? "Report language: Tamil | வரவேற்கிறோம்" : "Report language: Hindi | हिंदी में रिपोर्ट", 16, y + 5);
        doc.setTextColor(30, 30, 30);
        y += 18;
      }

      // 1. Patient
      section("Patient Information");
      row("Patient Name", name || "Not provided");
      row("Age", age ? age + " years" : "N/A");
      row("Gender", gender);
      row("Symptoms", symptoms);
      if (conditions) row("Pre-existing Conditions", conditions);
      if (allergies) row("Allergies", allergies);
      y += 4;

      // 2. Primary Diagnosis
      section("Primary Diagnosis", [59, 126, 255]);
      row("Disease", d.predicted_disease);
      row("Triage Level", tri.level);
      row("Triage Score", tri.score ? tri.score + "/100" : "N/A");
      row("Recommendation", tri.recommendation);
      y += 4;

      // 3. Treatment Plan
      section("Treatment Plan", [48, 160, 120]);
      row("Recommended Drug", d.recommended_drug);
      row("Dosage", d.dosage);
      row("Duration", d.duration);
      if (d.explanation) { para("Clinical Explanation: " + d.explanation); }
      y += 4;

      // 4. Step-by-step treatment
      if (d.treatment_plan?.length > 0) {
        section("Step-by-Step Treatment Plan", [80, 60, 200]);
        d.treatment_plan.forEach((step, i) => { para(`${i + 1}. ${step}`); });
        y += 4;
      }

      // 5. Lifestyle
      if (d.lifestyle?.length > 0) {
        section("Lifestyle Recommendations", [30, 160, 80]);
        d.lifestyle.forEach((l, i) => para(`• ${l}`));
        y += 4;
      }

      // 6. Drug Safety
      section("Drug Safety Assessment", [180, 100, 20]);
      row("Safety Level", ds?.safety_level);
      row("Risk Score", ds?.risk_score ? ds.risk_score + "/100" : "N/A");
      if (ds?.clinical_warnings?.length > 0) {
        ds.clinical_warnings.forEach(w => para(`⚠ ${w}`));
      } else { para("✓ No contraindications detected."); }
      y += 4;

      // 7. Warnings
      if (d.warnings?.length > 0) {
        section("Clinical Warnings", [200, 60, 60]);
        d.warnings.forEach(w => para(`⚠ ${w}`));
        y += 4;
      }

      // 8. Drug Interactions
      if (result.drug_interactions?.length > 0) {
        section("Drug Interactions", [180, 100, 40]);
        result.drug_interactions.forEach(w => para(`• ${w}`));
        y += 4;
      }

      // 9. When to seek care
      if (d.when_to_seek_care) {
        section("When to Seek Medical Care", [180, 140, 0]);
        para(d.when_to_seek_care);
        y += 4;
      }

      // 10. AI Doctor's Analysis
      if (aiExplain) {
        section("AI Doctor's Detailed Analysis", [94, 92, 230]);
        if (aiExplain.summary) para(aiExplain.summary);
        if (aiExplain.causes?.length > 0) {
          y += 2;
          doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(94, 92, 230);
          doc.text("Likely Causes:", 14, y); y += 5;
          aiExplain.causes.forEach((c, i) => para(`${i + 1}. ${c}`));
        }
        if (aiExplain.medicines?.length > 0) {
          y += 2;
          doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(59, 126, 255);
          doc.text("Recommended Medicines:", 14, y); y += 5;
          aiExplain.medicines.forEach(m => para(`• ${m.name} — ${m.purpose} (${m.timing})`));
        }
        if (aiExplain.when_to_seek_care) {
          y += 2;
          doc.setTextColor(180, 140, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
          doc.text("When to seek care:", 14, y); y += 5;
          para(aiExplain.when_to_seek_care);
        }
      }

      // 11. Reasoning Trace
      if (result.reasoning_trace?.length > 0) {
        section("AI Reasoning Trace", [60, 80, 120]);
        result.reasoning_trace.forEach((step, i) => para(`${i + 1}. ${step}`));
        y += 4;
      }

      // Footer
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5); doc.setTextColor(150, 150, 150); doc.setFont("helvetica", "italic");
        doc.text("myDoctor AI Clinical Report — For medical decision support only. Always consult a qualified healthcare provider.", 14, 290);
        doc.text(`Page ${i} of ${pages}`, W - 14, 290, { align: "right" });
      }

      doc.save(`myDoctor_Report_${Date.now()}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF report.");
    }
  };


  const filteredHistory = histFilter === "All" ? patientHistory : patientHistory.filter(p => p.triage === histFilter);


  return (
    <>
      <style>{injectCSS}</style>

      {/* Backdrop – visible on mobile when sidebar open */}
      <div className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="app-shell">

        {/* Mobile top bar – CSS shows/hides via media query */}
        <div className="mobile-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.3px" }}>my<span style={{ color: "#3b7eff" }}>Doctor</span></div>
          </div>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(v => !v)} aria-label="Open navigation">
            <span /><span /><span />
          </button>
        </div>

        {/* Sidebar – CSS controls sticky vs fixed+offscreen via media query */}
        <nav className={`app-sidebar${sidebarOpen ? " open" : ""}`}>
          <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>✕ Close</button>
          <div style={{ padding: "6px 12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.3px" }}>my<span style={{ color: ACCENT }}>Doctor</span></div>
              <div style={{ fontSize: 10, color: TEXT3 }}>Personal AI Health Assistant</div>
            </div>
          </div>

          {([
            ["diagnose", <svg key="d" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>, t(lang, "diagnose")],
            ["chat", <svg key="c" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, t(lang, "chat")],
            ["history", <svg key="h" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, t(lang, "history")],
            ["analytics", <svg key="a" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, t(lang, "analytics")],
          ]).map(([id, icon, label]) => (
            <button key={id} className={`slink ${tab===id?"active":""}`} onClick={() => { setTab(id); setSidebarOpen(false); }}>
              <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>{label}
            </button>
          ))}

          {/* Profile nav */}
          <button className="slink" onClick={() => router.push("/profile")} style={{ marginTop: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {t(lang, "profile")}
          </button>

          {/* Language toggle */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 10, color: TEXT3, fontWeight: 600, letterSpacing: "0.05em", padding: "0 13px", marginBottom: 7 }}>LANGUAGE</div>
            <div style={{ display: "flex", gap: 4, padding: "0 6px", flexWrap: "wrap" }}>
              {languages.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  style={{ padding: "5px 9px", borderRadius: 7, border: lang === l.code ? `1px solid ${ACCENT}` : `1px solid ${BORDER}`, background: lang === l.code ? `rgba(59,126,255,0.12)` : "transparent", color: lang === l.code ? ACCENT : TEXT2, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            {currentUser && (
              <button onClick={() => router.push("/profile")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", borderRadius: 11, background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, cursor: "pointer", marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {currentUser.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0,2)}
                </div>
                <div style={{ textAlign: "left", overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
                  <div style={{ fontSize: 10, color: TEXT3 }}>Patient · My Account</div>
                </div>
              </button>
            )}
            {/* Backend Status */}
            <div style={{ padding: "10px 13px", borderRadius: 12, background: backendOnline === false ? "rgba(255,69,58,0.08)" : "rgba(59,126,255,0.08)", border: `1px solid ${backendOnline === false ? "rgba(255,69,58,0.2)" : "rgba(59,126,255,0.2)"}` }}>
              <div style={{ fontSize: 10, color: backendOnline === false ? DANGER : ACCENT, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 7 }}>BACKEND SERVER</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: backendOnline === null ? WARNING : backendOnline ? SUCCESS : DANGER, animation: backendOnline !== false ? "pulse 2s infinite" : "none" }} />
                <span style={{ fontSize: 11.5, color: TEXT2 }}>{backendOnline === null ? "Checking..." : backendOnline ? "Connected · 10 agents ready" : "Offline — Start backend!"}</span>
              </div>
            </div>
            <button onClick={() => { logout(); router.push("/landing"); }} style={{ width: "100%", margin: "8px 0 0", padding: "8px", borderRadius: 10, border: `1px solid rgba(255,69,58,0.2)`, background: "rgba(255,69,58,0.06)", color: "rgba(255,69,58,0.8)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              Sign Out
            </button>
          </div>

          {isMobile && (<button onClick={() => setSidebarOpen(false)} style={{ display: "flex", marginLeft: "auto", marginBottom: 8, padding: "5px 10px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, cursor: "pointer", color: TEXT2, fontSize: 14, alignItems: "center", gap: 5 }}>✕ Close</button>)}
        </nav>

        {/* Content */}
        <main className="app-content">

          {/* Backend offline banner */}
          {backendOnline === false && (
            <div style={{ maxWidth: 1060, margin: "0 auto 18px", padding: "13px 18px", borderRadius: 14, background: "rgba(255,69,58,0.07)", border: "1px solid rgba(255,69,58,0.25)", display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.4s ease" }}>
              <span style={{ fontSize: 20 }}>🔴</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: DANGER, marginBottom: 2 }}>Backend Offline — Cannot Connect to AI Server</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>
                  Double-click <strong>backend/start_backend.bat</strong> or run: <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 7px", borderRadius: 5, fontFamily: "monospace", fontSize: 11 }}>python -m uvicorn main:app --reload --port 8000</code> inside the backend folder.
                </div>
              </div>
            </div>
          )}

          {/* DIAGNOSE */}
          {tab === "diagnose" && (
            <div style={{ maxWidth: 1060, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>{t(lang, "diagnosisTitle")}</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>{t(lang, "diagnosisSubtitle")}</p>
              </div>

              <div className="diagnose-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Input panel */}
                <div className="glass" style={{ padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>{t(lang, "patientInfo")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <div className="patient-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>{t(lang, "patientName")}</label>
                        <input className="field" placeholder={t(lang, "patientNamePlaceholder")} type="text" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>{t(lang, "age")}</label>
                        <input className="field" placeholder={t(lang, "agePlaceholder")} type="number" value={age} onChange={e => setAge(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>{t(lang, "gender")}</label>
                        <select className="field" value={gender} onChange={e => setGender(e.target.value)} style={{ cursor: "pointer" }}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: TEXT2, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, letterSpacing: "0.04em" }}>
                        <span>{t(lang, "symptoms")}</span>
                        {symptoms.length > 0 && (
                          <button onClick={() => { setSymptoms(""); if (listening) { recRef.current?.stop(); recRef.current = null; setListening(false); } }}
                            style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.22)", borderRadius: 8, color: "rgba(255,69,58,0.8)", fontSize: 11, fontWeight: 600, padding: "2px 9px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                            title="Clear symptoms">
                            ✕ Clear
                          </button>
                        )}
                      </label>
                      <div style={{ position: "relative" }}>
                        <textarea className="field" rows={4} placeholder={t(lang, "symptomsPlaceholder")}
                          value={symptoms} onChange={e => setSymptoms(e.target.value)}
                          style={{ resize: "none", paddingRight: 50 }} />
                        <button onClick={toggleListen} title={listening ? "Stop" : "Voice input"}
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
                          <span style={{ fontSize: 12, color: DANGER }}>🎙️ Listening in {lang === "ta" ? "Tamil" : lang === "hi" ? "Hindi" : "English"} — will auto-submit when done</span>
                        </div>
                      )}
                    </div>

                    <div className="pair-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "flex", alignItems: "center", gap: 4, marginBottom: 5, letterSpacing: "0.04em", flexWrap: "nowrap", overflow: "hidden" }}>
                          <span style={{ flexShrink: 0 }}>{t(lang, "conditions")}</span>
                          <span style={{ opacity: 0.4, fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}>({lang === "ta" ? "விரும்பினால்" : lang === "hi" ? "वैकल्पिक" : "optional"})</span>
                        </label>
                        <input className="field" placeholder={t(lang, "conditionsPlaceholder")} value={conditions} onChange={e => setConditions(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "flex", alignItems: "center", gap: 4, marginBottom: 5, letterSpacing: "0.04em", flexWrap: "nowrap", overflow: "hidden" }}>
                          <span style={{ flexShrink: 0 }}>{t(lang, "allergies")}</span>
                          <span style={{ opacity: 0.4, fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}>({lang === "ta" ? "விரும்பினால்" : lang === "hi" ? "वैकल्पिक" : "optional"})</span>
                        </label>
                        <input className="field" placeholder={t(lang, "allergiesPlaceholder")} value={allergies} onChange={e => setAllergies(e.target.value)} />
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={diagnose} disabled={loading || !symptoms.trim()} style={{ marginTop: 2, height: 46, width: "100%", gap: 10 }}>
                      {loading
                        ? <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> {t(lang, "analyzing")}</>
                        : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> {t(lang, "runDiagnosis")}</>}
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
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t(lang, "runningAgents")}</div>
                          <div style={{ fontSize: 11.5, color: TEXT2 }}>Symptom extraction → Diagnosis → Drug matching → Risk</div>
                        </div>
                      </div>
                      {[75,55,85,65].map((w,i) => <div key={i} className="skeleton" style={{ height: 12, width: `${w}%` }} />)}
                    </div>
                  )}


                  {/* Rich medical empty state */}
                  {!result && !loading && (<div className="glass" style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 18, right: 22, opacity: 0.06 }}><svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="1"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg></div>
                    <div style={{ position: "absolute", bottom: 14, left: 16, opacity: 0.05 }}><svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="1"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(59,126,255,0.07)", border: "2px solid rgba(59,126,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2.5s ease-in-out infinite", marginBottom: 20 }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t(lang, "enterPatientDetails")}</div>
                    <div style={{ fontSize: 12.5, color: "rgba(242,242,247,0.55)", marginBottom: 24, maxWidth: 260 }}>{t(lang, "aiAgentsWillAnalyze")}</div>
                    <div style={{ background: "rgba(59,126,255,0.06)", border: "1px solid rgba(59,126,255,0.14)", borderRadius: 14, padding: "14px 20px", maxWidth: 320, marginBottom: 20 }}>
                      <div style={{ fontSize: 12, color: "rgba(242,242,247,0.6)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 8 }}>"The good physician treats the disease; the great physician treats the patient who has the disease."</div>
                      <div style={{ fontSize: 11, color: "#3b7eff", fontWeight: 600 }}>� William Osler, Father of Modern Medicine</div>
                    </div>
                    <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
                      {[["10 AI Agents","#30d158"],["Real-time Analysis","#ffd60a"],["3 Languages","#3b7eff"]].map(([l,c])=>(<div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "rgba(242,242,247,0.55)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }}/>{l}</div>))}
                    </div>
                  </div>)}
                  {result && !loading && <>
                    <div className="glass" style={{ padding: 20, animation: "slideIn 0.4s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em", marginBottom: 4 }}>PRIMARY DIAGNOSIS</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.3px" }}>{result.treatment.predicted_disease}</div>
                            {groqFallback && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 14, background: "rgba(94,92,230,0.12)", border: "1px solid rgba(94,92,230,0.3)", color: "#8b8be8", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>🤖 AI-Enhanced (Grok)</span>
                            )}
                          </div>
                        </div>
                        <TriageBadge level={result.triage.level} />
                      </div>
                      <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{result.triage.recommendation}</div>
                    </div>

                    <div className="result-pair" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14 }}>
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



                    {result.treatment.warnings?.length > 0 && (
                      <div className="glass" style={{ padding: 18, borderColor: "rgba(255,69,58,0.22)", background: "rgba(255,69,58,0.03)", animation: "slideIn 0.4s ease 0.2s both" }}>
                        <div style={{ fontSize: 11, color: DANGER, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 9 }}>CLINICAL WARNINGS</div>
                        {result.treatment.warnings?.map((w,i) => (
                          <div key={i} style={{ fontSize: 12.5, color: TEXT2, padding: "5px 0", borderBottom: i<(result.treatment.warnings.length-1)?`1px solid rgba(255,255,255,0.04)`:"none" }}>⚠️ {w}</div>
                        ))}
                      </div>
                    )}

                    <button className="btn btn-ghost" onClick={downloadReport} style={{ justifyContent: "center", width: "100%", animation: "slideIn 0.4s ease 0.3s both" }}>
                      📄 Download Clinical Report (.pdf)
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

              {/* Results — bottom sections */}
              {result && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 18, animation: "fadeUp 0.5s ease 0.2s both" }}>

                  {/* Explanation card */}
                  {result.treatment.explanation && (
                    <div className="glass" style={{ padding: 20, animation: "slideIn 0.4s ease 0.15s both" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em" }}>📋 CLINICAL EXPLANATION</div>
                        <TTSButton text={result.treatment.explanation} fieldId="explanation" />
                      </div>
                      <div style={{ fontSize: 13.5, color: TEXT2, lineHeight: 1.65 }}>{result.treatment.explanation}</div>
                    </div>
                  )}

                  {/* Step-by-step treatment plan */}
                  {result.treatment.treatment_plan?.length > 0 && (
                    <div className="glass" style={{ padding: 20, animation: "slideIn 0.4s ease 0.18s both" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em" }}>🗂️ STEP-BY-STEP TREATMENT PLAN</div>
                        <TTSButton text={result.treatment.treatment_plan.join(". ")} fieldId="treatment_plan" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {result.treatment.treatment_plan.map((step, i) => (
                          <div key={i} style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55, padding: "8px 12px", borderRadius: 10, background: "rgba(59,126,255,0.05)", border: "1px solid rgba(59,126,255,0.1)" }}>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {result.follow_up_questions?.length > 0 && (
                    <div className="glass" style={{ padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>❓ Follow-up Questions</div>
                      <div style={{ fontSize: 12, color: TEXT3, marginBottom: 10 }}>Click a question to send it to the AI Chat</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {result.follow_up_questions.map((q, i) => (
                          <button key={i}
                            onClick={() => { setTab("chat"); setChatInput(q); }}
                            style={{ padding: "7px 13px", borderRadius: 20, border: `1px solid ${BORDER}`, background: "rgba(59,126,255,0.06)", color: TEXT2, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
                            onMouseEnter={e => { e.target.style.background = "rgba(59,126,255,0.14)"; e.target.style.color = TEXT; }}
                            onMouseLeave={e => { e.target.style.background = "rgba(59,126,255,0.06)"; e.target.style.color = TEXT2; }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    {/* Lifestyle */}
                    <div className="glass" style={{ padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:6}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10"/><path d="M12 2C6.48 2 2 6.48 2 12"/><path d="M2 12s4-4 10-2"/><path d="M12 22s-4-8 0-12"/></svg>{t(lang, "lifestyle")}</div>
                        {result.treatment.lifestyle?.length > 0 && (
                          <TTSButton text={result.treatment.lifestyle.join(". ")} fieldId="lifestyle" />
                        )}
                      </div>
                      {result.treatment.lifestyle?.length > 0 ? (
                        result.treatment.lifestyle.map((l, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: i < result.treatment.lifestyle.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(48,209,88,0.12)", border: "1px solid rgba(48,209,88,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, marginTop: 1 }}>✓</div>
                            <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{l}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: 13, color: TEXT3, fontStyle: "italic" }}>Run a diagnosis to see personalized lifestyle recommendations.</div>
                      )}
                    </div>
                    {/* Drug Safety */}
                    <div className="glass" style={{ padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 13 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:6}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>{t(lang, "drugSafety")}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                        <span style={{ fontSize: 13, color: TEXT2 }}>Safety Level</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: result.drug_safety.safety_level==="SAFE"?"rgba(48,209,88,0.1)":result.drug_safety.safety_level==="UNSAFE"?"rgba(255,69,58,0.1)":"rgba(255,214,10,0.1)", color: result.drug_safety.safety_level==="SAFE"?SUCCESS:result.drug_safety.safety_level==="UNSAFE"?DANGER:WARNING }}>{result.drug_safety.safety_level}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                        <span style={{ fontSize: 13, color: TEXT2 }}>Risk Score</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{result.drug_safety.risk_score}/100</span>
                      </div>
                      {result.drug_safety.clinical_warnings?.length === 0
                        ? <div style={{ marginTop: 8, fontSize: 12, color: SUCCESS, padding: "6px 10px", borderRadius: 8, background: "rgba(48,209,88,0.06)", border: "1px solid rgba(48,209,88,0.15)" }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:5}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{t(lang, "noContraindications")}</div>
                        : result.drug_safety.clinical_warnings.map((w,i) => <div key={i} style={{ marginTop: 6, fontSize: 12, color: WARNING, padding: "6px 10px", borderRadius: 8, background: "rgba(255,214,10,0.06)", border: "1px solid rgba(255,214,10,0.14)" }}>⚠️ {w}</div>)
                      }
                    </div>
                  </div>

                  {/* When to seek care */}
                  {result.treatment.when_to_seek_care && (
                    <div className="glass" style={{ padding: 18, borderColor: "rgba(255,214,10,0.22)", background: "rgba(255,214,10,0.03)" }}>
                      <div style={{ fontSize: 11, color: WARNING, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:6}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{t(lang, "whenToSeekCare").toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{result.treatment.when_to_seek_care}</div>
                    </div>
                  )}

                  {/* Drug Interactions */}
                  {result.drug_interactions?.length > 0 && (
                    <div className="glass" style={{ padding: 20, borderColor: "rgba(255,149,0,0.25)", background: "rgba(255,149,0,0.03)", animation: "slideIn 0.4s ease 0.25s both" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#ff9500" }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:6}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>{t(lang, "drugInteractions")} ({result.drug_interactions.length})</div>
                      {result.drug_interactions.map((w, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: TEXT2, padding: "7px 10px", marginBottom: 6, borderRadius: 9, background: "rgba(255,149,0,0.07)", border: "1px solid rgba(255,149,0,0.18)", lineHeight: 1.55 }}>{w}</div>
                      ))}
                    </div>
                  )}

                  {/* ── AI Doctor's Detailed Analysis Card ─── */}
                  {(explainLoading || aiExplain) && (
                    <div className="glass" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(94,92,230,0.3)", background: "rgba(94,92,230,0.04)", animation: "fadeUp 0.5s ease" }}>
                      {/* Card Header */}
                      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(94,92,230,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#5e5ce6,#3b7eff)", display: "flex", alignItems: "center", justifyContent: "center", display:"flex", alignItems:"center", justifyContent:"center" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3A8 8 0 0 0 4 12"/><path d="M17.7 6.3A8 8 0 0 1 20 12"/><path d="M6.3 17.7A8 8 0 0 0 12 20"/><path d="M17.7 17.7A8 8 0 0 1 12 20"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg></div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>AI Doctor's Detailed Analysis</div>
                            <div style={{ fontSize: 10.5, color: "rgba(94,92,230,0.8)", marginTop: 1 }}>Powered by Groq · llama-3.3-70b-versatile</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {!explainLoading && aiExplain && (
                            <TTSButton
                              text={[
                                aiExplain.summary,
                                aiExplain.causes?.join(". "),
                                aiExplain.lifestyle?.join(". "),
                                aiExplain.when_to_seek_care
                              ].filter(Boolean).join(" ")}
                              fieldId="ai_analysis"
                            />
                          )}
                          {!explainLoading && (
                            <button onClick={regenerateExplain}
                              style={{ padding: "6px 13px", borderRadius: 9, border: "1px solid rgba(94,92,230,0.3)", background: "rgba(94,92,230,0.08)", color: "#8b8be8", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(94,92,230,0.16)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(94,92,230,0.08)"}
                            >
                              <svg style={{display:"inline",verticalAlign:"middle",marginRight:5}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.24"/></svg> Regenerate
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Loading Skeleton */}
                      {explainLoading && (
                        <div style={{ padding: 20 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                            <div style={{ width: 20, height: 20, border: "2px solid rgba(94,92,230,0.25)", borderTopColor: "#5e5ce6", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                            <span style={{ fontSize: 12.5, color: "rgba(94,92,230,0.7)" }}>Dr. MedAI is analysing your symptoms...</span>
                          </div>
                          {[80, 60, 90, 55, 72].map((w, i) => (
                            <div key={i} className="skeleton" style={{ height: 11, width: `${w}%`, marginBottom: 10, borderRadius: 6 }} />
                          ))}
                        </div>
                      )}

                      {/* Rendered Analysis */}
                      {!explainLoading && aiExplain && (
                        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

                          {/* Severity badge + Summary */}
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            {aiExplain.severity && (
                              <span style={{
                                flexShrink: 0, padding: "4px 11px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
                                background: aiExplain.severity === "severe" ? "rgba(255,69,58,0.1)" : aiExplain.severity === "moderate" ? "rgba(255,214,10,0.1)" : "rgba(48,209,88,0.1)",
                                color: aiExplain.severity === "severe" ? DANGER : aiExplain.severity === "moderate" ? WARNING : SUCCESS,
                                border: `1px solid ${aiExplain.severity === "severe" ? "rgba(255,69,58,0.25)" : aiExplain.severity === "moderate" ? "rgba(255,214,10,0.25)" : "rgba(48,209,88,0.25)"}`
                              }}>
                                {aiExplain.severity?.toUpperCase()}
                              </span>
                            )}
                            <p style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.7, margin: 0 }}>{aiExplain.summary}</p>
                          </div>

                          {/* Causes */}
                          {aiExplain.causes?.length > 0 && (
                            <div>
                              <div style={{ fontSize: 10, color: "rgba(94,92,230,0.8)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:5}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(94,92,230,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 18 1.5-7.5"/><path d="M3.5 14h13"/><path d="m14 6-3-3-3 3"/><path d="M14 18h5l-5-7H8l-2 3"/></svg>LIKELY CAUSES</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {aiExplain.causes.map((c, i) => (
                                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(94,92,230,0.12)", border: "1px solid rgba(94,92,230,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#8b8be8", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                                    <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{c}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medicines */}
                          {aiExplain.medicines?.length > 0 && (
                            <div>
                              <div style={{ fontSize: 10, color: "rgba(59,126,255,0.9)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:5}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(59,126,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>RECOMMENDED MEDICINES</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                                {aiExplain.medicines.map((med, i) => (
                                  <div key={i} style={{ padding: "11px 14px", borderRadius: 11, background: "rgba(59,126,255,0.05)", border: "1px solid rgba(59,126,255,0.12)" }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: ACCENT, marginBottom: 3 }}>{med.name}</div>
                                    <div style={{ fontSize: 12.5, color: TEXT2, marginBottom: 2 }}>{med.purpose}</div>
                                    <div style={{ fontSize: 11.5, color: TEXT3, fontStyle: "italic" }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:4}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(242,242,247,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{med.timing}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lifestyle */}
                          {aiExplain.lifestyle?.length > 0 && (
                            <div>
                              <div style={{ fontSize: 10, color: "rgba(48,209,88,0.9)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:5}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(48,209,88,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>PERSONALISED LIFESTYLE TIPS</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {aiExplain.lifestyle.map((tip, i) => (
                                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: SUCCESS, flexShrink: 0, marginTop: 1 }}>✓</div>
                                    <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* When to seek care */}
                          {aiExplain.when_to_seek_care && (
                            <div style={{ padding: "12px 14px", borderRadius: 11, background: "rgba(255,214,10,0.04)", border: "1px solid rgba(255,214,10,0.2)" }}>
                              <div style={{ fontSize: 10, color: WARNING, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 7 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:6}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{t(lang, "whenToSeekCare").toUpperCase()}</div>
                              <p style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6, margin: 0 }}>{aiExplain.when_to_seek_care}</p>
                            </div>
                          )}

                          {/* Disclaimer */}
                          <div style={{ paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: TEXT3, fontStyle: "italic", lineHeight: 1.5 }}>
                            <svg style={{display:"inline",verticalAlign:"middle",marginRight:5}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(242,242,247,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>{aiExplain.disclaimer || "This is AI medical guidance, not a substitute for professional clinical care. Always consult a qualified healthcare provider."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  {/* Reasoning Trace Accordion */}
                  {result.reasoning_trace?.length > 0 && (
                    <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
                      <button
                        onClick={() => setTraceOpen(o => !o)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:6}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3A8 8 0 0 0 4 12"/><path d="M17.7 6.3A8 8 0 0 1 20 12"/><path d="M6.3 17.7A8 8 0 0 0 12 20"/><path d="M17.7 17.7A8 8 0 0 1 12 20"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>{t(lang, "reasoningTrace")}</span>
                        <span style={{ fontSize: 18, color: TEXT3, transition: "transform 0.2s", transform: traceOpen ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</span>
                      </button>
                      {traceOpen && (
                        <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {result.reasoning_trace.map((step, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(59,126,255,0.12)", border: `1px solid rgba(59,126,255,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ACCENT, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                              <span style={{ fontSize: 12.5, color: TEXT2, lineHeight: 1.6 }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* CHAT */}
          {tab === "chat" && (
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3, display:"flex", alignItems:"center", gap: 10 }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>{t(lang, "chatTitle")}</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>{t(lang, "chatSubtitle")} · speaking <span style={{ color: ACCENT, fontWeight: 600 }}>{languages.find(l => l.code === lang)?.full || "English"}</span></p>
              </div>

              {/* Messages */}
              <div className="glass" style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", marginBottom: 14 }}>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "chat-user" : "chat-ai"}>
                    {m.role === "ai" && (
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0, marginBottom: 2 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg></div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: m.role === "ai" ? "78%" : "72%" }}>
                      <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>
                        <ChatMessage content={m.content} />
                      </div>
                      {m.role === "ai" && (
                        <button
                          onClick={() => speakText(m.content, `chat_${i}`)}
                          title={speakingField === `chat_${i}` ? "Stop speaking" : "Read aloud"}
                          style={{ alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: speakingField === `chat_${i}` ? DANGER : TEXT3, padding: "2px 4px", borderRadius: 6, transition: "all 0.2s" }}
                        >
                          {speakingField === `chat_${i}` ? "🔇" : "🔊"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-ai">
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg></div>
                    <div className="bubble-ai" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Dots /> <span style={{ fontSize: 12, color: TEXT3 }}>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>

              {/* Input row */}
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <input className="field" placeholder={t(lang, "chatPlaceholder")} value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  style={{ flex: 1 }} />
                {/* Mic button */}
                <button onClick={toggleChatListen}
                  style={{ width: 46, height: 46, borderRadius: 12, border: `1px solid ${chatListening ? "rgba(255,69,58,0.5)" : BORDER}`, background: chatListening ? "rgba(255,69,58,0.12)" : SURFACE, color: chatListening ? "#ff453a" : TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", animation: chatListening ? "pulse 1s ease infinite" : "none" }}
                  title={`Voice input (${languages.find(l => l.code === lang)?.full})`}>
                  {chatListening ? "◼" : (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>)}
                </button>
                <button className="btn btn-primary" onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                  style={{ width: 46, height: 46, padding: 0, borderRadius: 12, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>

              {/* Quick prompts */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
                {[...(lang==="ta"?["காய்ச்சல் சிகிச்சை","நீரிழிவு வாழ்க்கை முறை","மார்பு வலி காரணங்கள்","COVID அறிகுறிகள்","மன அழுத்தம்","உயர் இரத்த அழுத்த உணவு"]:lang==="hi"?["बुखार का इलाज","मधुमेह जीवनशैली","सीने में दर्द के कारण","COVID लक्षण","तनाव और मानसिक स्वास्थ्य","उच्च रक्तचाप आहार"]:["Dengue fever treatment","Diabetes lifestyle tips","Chest pain causes","COVID symptoms","Stress & mental health","Hypertension diet"])].map(q => (
                  <button key={q} className="btn btn-ghost" style={{ fontSize: 11.5, padding: "5px 12px", borderRadius: 20 }} onClick={() => { setChatInput(q); }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3, display:"flex", alignItems:"center", gap: 10 }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>{t(lang, "historyTitle")}</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>Your personal consultation history — private and secure</p>
              </div>

              {!currentUser ? (
                <div className="glass" style={{ padding: 48, textAlign: "center" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom: 16, opacity:0.4 }}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Sign in to view your records</div>
                  <div style={{ fontSize: 14, color: TEXT2, marginBottom: 22 }}>Your consultation history is private and only visible when you're logged in.</div>
                  <button className="btn btn-primary" onClick={() => router.push("/landing")}>Sign In</button>
                </div>
              ) : (
                <>
                  <div className="glass" style={{ overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{filteredHistory.length} Consultation{filteredHistory.length !== 1 ? "s" : ""}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {["All","HIGH","MODERATE","LOW"].map(f => (
                          <button key={f} className={`ntab ${histFilter===f?"on":""}`} onClick={() => setHistFilter(f)}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px" }}>
                      {filteredHistory.map((p, i) => (
                        <div key={p.id} className="histrow" onClick={() => setSelHistory(selHistory?.id===p.id ? null : p)} style={{ animation: `fadeUp 0.3s ease ${i*0.05}s both` }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: p.triage==="HIGH" ? "rgba(255,69,58,0.12)" : p.triage==="MODERATE" ? "rgba(255,214,10,0.12)" : "rgba(48,209,88,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                            {p.triage==="HIGH"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff453a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>:p.triage==="MODERATE"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>{p.disease}</div>
                            <div style={{ fontSize: 12, color: TEXT2 }}>{p.date}</div>
                            <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.symptoms?.slice(0,60)}{p.symptoms?.length > 60 ? "..." : ""}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: ACCENT, marginBottom: 4 }}><svg style={{display:"inline",verticalAlign:"middle",marginRight:4}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>{p.drug?.slice(0,18)}{p.drug?.length > 18 ? "..." : ""}</div>
                            <TriageBadge level={p.triage} />
                          </div>
                        </div>
                      ))}
                      {filteredHistory.length === 0 && (
                        <div style={{ padding: "40px 24px", textAlign: "center" }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>🩺</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT2, marginBottom: 6 }}>No consultations yet</div>
                          <div style={{ fontSize: 13, color: TEXT3 }}>Run your first AI diagnosis to see records here</div>
                          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab("diagnose")}>Start Diagnosis</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {selHistory && (
                    <div className="glass" style={{ padding: 22, animation: "slideIn 0.3s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 19, fontWeight: 700 }}>{selHistory.disease}</div>
                          <div style={{ fontSize: 12.5, color: TEXT2, marginTop: 3 }}>{selHistory.date}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <TriageBadge level={selHistory.triage} />
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setSelHistory(null)}>Close ✕</button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, marginBottom: 14 }}>
                        {[["💊 Medication", selHistory.drug],["📏 Dosage", selHistory.dosage],["⏱️ Duration", selHistory.duration]].map(([l,v],i) => (
                          <div key={i} style={{ padding: "14px 16px", borderRadius: 13, background: SURFACE, border: `1px solid ${BORDER}` }}>
                            <div style={{ fontSize: 10.5, color: TEXT3, letterSpacing: "0.04em", marginBottom: 7 }}>{l}</div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: ACCENT }}>{v || "N/A"}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                        <div style={{ padding: "14px 16px", borderRadius: 13, background: SURFACE, border: `1px solid ${BORDER}` }}>
                          <div style={{ fontSize: 10.5, color: TEXT3, letterSpacing: "0.04em", marginBottom: 8 }}>SYMPTOMS REPORTED</div>
                          <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{selHistory.symptoms}</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 13, background: SURFACE, border: `1px solid ${BORDER}` }}>
                          <div style={{ fontSize: 10.5, color: TEXT3, letterSpacing: "0.04em", marginBottom: 8 }}>🌿 LIFESTYLE TIPS</div>
                          {selHistory.lifestyle?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {selHistory.lifestyle.slice(0,3).map((l,i) => (
                                <div key={i} style={{ fontSize: 12.5, color: TEXT2, display: "flex", gap: 7, alignItems: "flex-start" }}>
                                  <span style={{ color: SUCCESS, flexShrink: 0 }}>•</span>{l}
                                </div>
                              ))}
                            </div>
                          ) : <div style={{ fontSize: 13, color: TEXT3 }}>No lifestyle data</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {tab === "analytics" && analyticsData && (
            <div style={{ maxWidth: 980, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>Analytics</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>System performance and diagnosis distribution overview</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13, marginBottom: 18 }}>
                {[
                  [analyticsData?.totalConsultations ?? patientHistory.length ?? "...", "Total Consultations", "🩺", analyticsData?.totalConsultations ? `${patientHistory.length} records` : "Live from DB"],
                  [analyticsData?.triage?.find(t => t.level === "HIGH")?.count ?? "...", "High Risk Cases", "🚨", "Real-time triage data"],
                  [analyticsData?.diseases?.length ? `${analyticsData.diseases.length} types` : "...", "Disease Types", "🎯", "Tracked from records"],
                  ["10/10", "Agents Active", "🤖", "100% uptime"],
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

// ── Default export wraps AppInner in Suspense (required for useSearchParams) ──
export default function App() {
  return (
    <Suspense fallback={<div style={{ background: "#060912", minHeight: "100vh" }} />}>
      <AppInner />
    </Suspense>
  );
}
