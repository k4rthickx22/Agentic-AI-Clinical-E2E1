"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { diagnosePatient, fetchHistory, fetchAnalytics, sendChatMessage, downloadPdfReport, getStoredUser, logout } from "@/services/api";
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

export default function App() {
  const router = useRouter();
  const [tab, setTab] = useState("diagnose");
  // ── Fix hydration: don't read localStorage on server ──────────
  const [lang, setLang] = useState("en");
  const [currentUser, setCurrentUser] = useState(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null); // null=checking, true=ok, false=offline
  const [speaking, setSpeaking] = useState(false); // TTS state

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
    setCurrentUser(getStoredUser());
    // ── Backend health check ──────────────────────────────────────
    fetch("http://127.0.0.1:8000/api/health")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setBackendOnline(d.status === "ok"))
      .catch(() => setBackendOnline(false));
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
  // Refs to hold transcript without triggering re-renders mid-speech
  const diagTranscriptRef = useRef("");
  const chatTranscriptRef = useRef("");

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetchHistory().then(setPatientHistory).catch(console.error);
    fetchAnalytics().then(setAnalyticsData).catch(console.error);
  }, []);

  const diagnose = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const raw = await diagnosePatient(Number(age) || 30, symptoms, gender, conditions, name || "Anonymous", allergies || "none");

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
      };

      setResult(normalized);

      // Refresh history & analytics in background
      fetchHistory().then(setPatientHistory).catch(console.error);
      fetchAnalytics().then(setAnalyticsData).catch(console.error);

    } catch (error) {
      console.error(error);
      alert("Backend connection failed. Check if FastAPI server is running.");
    }
    setLoading(false);
  };


  // ── Voice recognition – shared lang codes ───────────────────
  const LANG_CODES = { en: "en-US", ta: "ta-IN", hi: "hi-IN" };

  // ── Diagnosis voice: continuous mode so English doesn't cut off ─
  const toggleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported. Please use Chrome or Edge."); return; }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    diagTranscriptRef.current = "";
    const rec = new SR();
    rec.continuous = true;       // ← KEY FIX: keeps listening across pauses
    rec.interimResults = true;   // show words as you speak
    rec.maxAlternatives = 1;
    rec.lang = LANG_CODES[lang] || "en-US";
    rec.onresult = e => {
      // Accumulate all results (interim + final) into one string
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + (e.results[i].isFinal ? " " : "");
      }
      diagTranscriptRef.current = full.trim();
      setSymptoms(full.trim());
    };
    rec.onend = () => {
      setListening(false);
      // Auto-submit after voice ends if there's a transcript
      const captured = diagTranscriptRef.current.trim();
      if (captured) {
        setTimeout(() => diagnose(), 300);
      }
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech") setListening(false);
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  // ── Chat voice: continuous mode, auto-sends on stop ─────────────
  const toggleChatListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported. Please use Chrome or Edge."); return; }
    if (chatListening) {
      chatRecRef.current?.stop();
      setChatListening(false);
      return;
    }
    chatTranscriptRef.current = "";
    const rec = new SR();
    rec.continuous = true;       // ← KEY FIX: keeps listening across pauses
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = LANG_CODES[lang] || "en-US";
    rec.onresult = e => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + (e.results[i].isFinal ? " " : "");
      }
      chatTranscriptRef.current = full.trim();
      setChatInput(full.trim());
    };
    rec.onend = () => {
      setChatListening(false);
      const captured = chatTranscriptRef.current.trim();
      if (captured) {
        setChatInput("");
        chatTranscriptRef.current = "";
        setTimeout(() => sendChatWithMsg(captured), 200);
      }
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech") setChatListening(false);
    };
    chatRecRef.current = rec;
    rec.start();
    setChatListening(true);
  };

  // ── Text-to-Speech: AI reads responses aloud ─────────────────
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[\u{1F600}-\u{1FFFF}]/gu, "").trim());
    const voiceLang = { en: "en-US", ta: "ta-IN", hi: "hi-IN" }[lang] || "en-US";
    utter.lang = voiceLang;
    utter.rate = 0.92;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
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

  const downloadReport = async () => {
    if (!result) return;
    try {
      const d = result.treatment, t = result.triage, s = result.drug_safety;
      const reportData = {
        age: age,
        gender: gender,
        disease: d.predicted_disease,
        symptoms: symptoms,
        drug: d.recommended_drug,
        dosage: d.dosage,
        duration: d.duration,
        lifestyle: d.lifestyle,
        warnings: d.warnings,
        triage: t.level
      };
      const blob = await downloadPdfReport(reportData);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Clinical_Report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF report.");
    }
  };

  const filteredHistory = histFilter === "All" ? patientHistory : patientHistory.filter(p => p.triage === histFilter);

  return (
    <>
      <style>{injectCSS}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <nav style={{ width: 210, padding: "22px 12px", display: "flex", flexDirection: "column", gap: 3, borderRight: `1px solid ${BORDER}`, position: "sticky", top: 0, height: "100vh", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "6px 12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 33, height: 33, borderRadius: 9, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🩺</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>MedAI Doctor</div>
              <div style={{ fontSize: 10, color: TEXT3 }}>Personal AI Health Assistant</div>
            </div>
          </div>

          {[
            ["diagnose","🩺", t(lang, "diagnose")],
            ["chat","💬", t(lang, "chat")],
            ["history","📁", t(lang, "history")],
            ["analytics","📊", t(lang, "analytics")],
          ].map(([id,icon,label]) => (
            <button key={id} className={`slink ${tab===id?"active":""}`} onClick={() => setTab(id)}>
              <span style={{ fontSize: 16 }}>{icon}</span>{label}
            </button>
          ))}

          {/* Profile nav */}
          <button className="slink" onClick={() => router.push("/profile")} style={{ marginTop: 4 }}>
            <span style={{ fontSize: 16 }}>👤</span>{t(lang, "profile")}
          </button>

          {/* Language toggle */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 10, color: TEXT3, fontWeight: 600, letterSpacing: "0.05em", padding: "0 13px", marginBottom: 7 }}>LANGUAGE</div>
            <div style={{ display: "flex", gap: 4, padding: "0 6px", flexWrap: "wrap" }}>
              {languages.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); localStorage.setItem("lang", l.code); }}
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

        </nav>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "28px 26px" }}>

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
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>Clinical Diagnosis</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>AI-powered multi-agent medical decision support system</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Input panel */}
                <div className="glass" style={{ padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Patient Information</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>NAME</label>
                        <input className="field" placeholder="e.g. John Doe" type="text" value={name} onChange={e => setName(e.target.value)} />
                      </div>
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>PRE-EXISTING CONDITIONS <span style={{ opacity: 0.4 }}>(optional)</span></label>
                        <input className="field" placeholder="e.g. hypertension, kidney disease" value={conditions} onChange={e => setConditions(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: TEXT2, display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>ALLERGIES <span style={{ opacity: 0.4 }}>(optional)</span></label>
                        <input className="field" placeholder="e.g. penicillin, sulfa, peanuts" value={allergies} onChange={e => setAllergies(e.target.value)} />
                      </div>
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
                      <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em", marginBottom: 8 }}>📋 CLINICAL EXPLANATION</div>
                      <div style={{ fontSize: 13.5, color: TEXT2, lineHeight: 1.65 }}>{result.treatment.explanation}</div>
                    </div>
                  )}

                  {/* Step-by-step treatment plan */}
                  {result.treatment.treatment_plan?.length > 0 && (
                    <div className="glass" style={{ padding: 20, animation: "slideIn 0.4s ease 0.18s both" }}>
                      <div style={{ fontSize: 11, color: TEXT3, letterSpacing: "0.05em", marginBottom: 12 }}>🗂️ STEP-BY-STEP TREATMENT PLAN</div>
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    {/* Lifestyle */}
                    <div className="glass" style={{ padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 13 }}>🌿 Lifestyle Recommendations</div>
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
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 13 }}>🛡️ Drug Safety Assessment</div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                        <span style={{ fontSize: 13, color: TEXT2 }}>Safety Level</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: result.drug_safety.safety_level==="SAFE"?"rgba(48,209,88,0.1)":result.drug_safety.safety_level==="UNSAFE"?"rgba(255,69,58,0.1)":"rgba(255,214,10,0.1)", color: result.drug_safety.safety_level==="SAFE"?SUCCESS:result.drug_safety.safety_level==="UNSAFE"?DANGER:WARNING }}>{result.drug_safety.safety_level}</span>
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

                  {/* When to seek care */}
                  {result.treatment.when_to_seek_care && (
                    <div className="glass" style={{ padding: 18, borderColor: "rgba(255,214,10,0.22)", background: "rgba(255,214,10,0.03)" }}>
                      <div style={{ fontSize: 11, color: WARNING, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 8 }}>🏥 WHEN TO SEEK MEDICAL CARE</div>
                      <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{result.treatment.when_to_seek_care}</div>
                    </div>
                  )}

                  {/* Drug Interactions */}
                  {result.drug_interactions?.length > 0 && (
                    <div className="glass" style={{ padding: 20, borderColor: "rgba(255,149,0,0.25)", background: "rgba(255,149,0,0.03)", animation: "slideIn 0.4s ease 0.25s both" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#ff9500" }}>💊 Drug Interaction Alerts ({result.drug_interactions.length})</div>
                      {result.drug_interactions.map((w, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: TEXT2, padding: "7px 10px", marginBottom: 6, borderRadius: 9, background: "rgba(255,149,0,0.07)", border: "1px solid rgba(255,149,0,0.18)", lineHeight: 1.55 }}>{w}</div>
                      ))}
                    </div>
                  )}

                  {/* Reasoning Trace Accordion */}
                  {result.reasoning_trace?.length > 0 && (
                    <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
                      <button
                        onClick={() => setTraceOpen(o => !o)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>🧠 How did AI decide this?</span>
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
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>🩺 AI Medical Chat</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>Clinical knowledge assistant — powered by medical AI · speaking <span style={{ color: ACCENT, fontWeight: 600 }}>{languages.find(l => l.code === lang)?.full || "English"}</span></p>
              </div>

              {/* Messages */}
              <div className="glass" style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", marginBottom: 14 }}>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "chat-user" : "chat-ai"}>
                    {m.role === "ai" && (
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginBottom: 2 }}>🧠</div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: m.role === "ai" ? "78%" : "72%" }}>
                      <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>
                        <ChatMessage content={m.content} />
                      </div>
                      {m.role === "ai" && (
                        <button
                          onClick={() => speaking ? stopSpeaking() : speakText(m.content)}
                          title={speaking ? "Stop speaking" : "Read aloud"}
                          style={{ alignSelf: "flex-start", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: speaking ? DANGER : TEXT3, padding: "2px 4px", borderRadius: 6, transition: "all 0.2s" }}
                        >
                          {speaking ? "🔇" : "🔊"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-ai">
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🧠</div>
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
                  {chatListening ? "🔴" : "🎙️"}
                </button>
                <button className="btn btn-primary" onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                  style={{ width: 46, height: 46, padding: 0, borderRadius: 12, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>

              {/* Quick prompts */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
                {["Dengue fever treatment","Diabetes lifestyle tips","Chest pain causes","COVID symptoms","Stress & mental health","Hypertension diet"].map(q => (
                  <button key={q} className="btn btn-ghost" style={{ fontSize: 11.5, padding: "5px 12px", borderRadius: 20 }} onClick={() => { setChatInput(q); }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 3 }}>📁 My Health Records</h1>
                <p style={{ color: TEXT2, fontSize: 14 }}>Your personal consultation history — private and secure</p>
              </div>

              {!currentUser ? (
                <div className="glass" style={{ padding: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
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
                            {p.triage==="HIGH"?"🚨":p.triage==="MODERATE"?"⚠️":"✅"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>{p.disease}</div>
                            <div style={{ fontSize: 12, color: TEXT2 }}>{p.date}</div>
                            <div style={{ fontSize: 12, color: TEXT3, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.symptoms?.slice(0,60)}{p.symptoms?.length > 60 ? "..." : ""}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>💊 {p.drug?.slice(0,18)}{p.drug?.length > 18 ? "..." : ""}</div>
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
