"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateProfile, getUserActivity, logout, getStoredUser, clearHistory } from "@/services/api";
import { t } from "@/lib/i18n";

const ACCENT = "#3b7eff";
const SUCCESS = "#30d158";
const WARNING = "#ffd60a";
const TEXT = "#f2f2f7";
const TEXT2 = "rgba(242,242,247,0.55)";
const TEXT3 = "rgba(242,242,247,0.3)";
const SURFACE = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const DANGER = "#ff453a";

const TRIAGE_COLOR = { HIGH: DANGER, MODERATE: WARNING, LOW: SUCCESS };
const triageBg = (triage) =>
  triage === "HIGH" ? "255,69,58" : triage === "MODERATE" ? "255,214,10" : "48,209,88";

// Professional inline SVG icons
const IconStethoscope = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
  </svg>
);
const IconCalendar = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconClock = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconEdit = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconUser = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconActivity = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconAlertHigh = ({ size = 16, color = DANGER }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCheck = ({ size = 16, color = SUCCESS }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  // Always defaulting to English; only honour a lang param from URL if present
  const [lang] = useState("en");
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [clearingActivity, setClearingActivity] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) { router.push("/landing"); return; }
    setUser(stored);
    setEditName(stored.name || "");
    getMe().then(setUser).catch(() => {});
    getUserActivity()
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoadingActivity(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await updateProfile(editName);
      setUser((u) => ({ ...u, name: res.name }));
      const stored = getStoredUser();
      if (stored) localStorage.setItem("auth_user", JSON.stringify({ ...stored, name: res.name }));
      setSaveMsg("success"); setEditing(false);
    } catch { setSaveMsg("error"); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); router.push("/landing"); };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const fmtDate = (iso, style = "long") =>
    iso ? new Date(iso).toLocaleDateString(
      lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : "en-US",
      { year: "numeric", month: style, day: "numeric" }
    ) : "N/A";

  const joinDate = fmtDate(user.created_at);
  const lastLoginDate = fmtDate(user.last_login, "short");

  const statCards = [
    { value: `${activity.length}`, label: t(lang, "totalConsultations"), icon: <IconStethoscope color={ACCENT} /> },
    { value: joinDate, label: t(lang, "memberSince"), icon: <IconCalendar color={WARNING} /> },
    { value: lastLoginDate, label: t(lang, "lastLogin"), icon: <IconClock color={SUCCESS} /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: radial-gradient(circle at 50% 0%, #1a2342 0%, #060912 60%); background-attachment: fixed; color: ${TEXT}; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .field { width:100%; background:rgba(255,255,255,0.05); border:1px solid ${BORDER}; border-radius:12px; padding:12px 15px; color:${TEXT}; font-size:14px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .field:focus { border-color:${ACCENT}; box-shadow:0 0 0 3px rgba(59,126,255,0.12); }
        .field::placeholder { color:rgba(242,242,247,0.3); }
        .glass { background:${SURFACE}; border:1px solid ${BORDER}; border-radius:18px; backdrop-filter:blur(20px); transition:border-color 0.2s; }
        .glass:hover { border-color:rgba(255,255,255,0.13); }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; border:none; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .btn-primary { background:${ACCENT}; color:white; padding:11px 22px; }
        .btn-primary:hover { background:#2d6fe8; transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,126,255,0.4); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-ghost { background:rgba(255,255,255,0.05); border:1px solid ${BORDER}; color:${TEXT2}; padding:9px 18px; }
        .btn-ghost:hover { background:rgba(255,255,255,0.08); color:${TEXT}; }
        .btn-danger { background:rgba(255,69,58,0.1); border:1px solid rgba(255,69,58,0.25); color:${DANGER}; padding:9px 18px; }
        .btn-danger:hover { background:rgba(255,69,58,0.18); }
        .tag { display:inline-flex; align-items:center; gap:6px; padding:5px 13px; border-radius:100px; font-size:12px; font-weight:600; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
      `}</style>

      <div style={{ minHeight: "100vh", padding: "36px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "Inter, -apple-system, sans-serif", color: TEXT }}>

          {/* Back */}
          <button className="btn btn-ghost" onClick={() => router.push("/clinic")} style={{ marginBottom: 20, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            {t(lang, "diagnosisTitle") ? t(lang, "diagnose") : "Back to Clinic"}
          </button>

          {/* Header card */}
          <div className="glass" style={{ padding: 32, marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 22, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #5e5ce6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white", flexShrink: 0 }}>
                {initials}
              </div>

              <div style={{ flex: 1 }}>
                {!editing ? (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 4 }}>{user.name}</div>
                    <div style={{ fontSize: 13.5, color: TEXT2, marginBottom: 12 }}>{user.email}</div>
                    <div className="tag" style={{ background: "rgba(59,126,255,0.1)", border: "1px solid rgba(59,126,255,0.2)", color: ACCENT }}>
                      <IconUser size={13} color={ACCENT} /> {t(lang, "yourRole") || "Patient"} &mdash; {t(lang, "totalConsultations") || "My Account"}
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
                    <div>
                      <label style={{ fontSize: 11, color: TEXT3, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>
                        {lang === "ta" ? "முழு பெயர்" : lang === "hi" ? "पूरा नाम" : "FULL NAME"}
                      </label>
                      <input className="field" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!editing ? (
                  <button className="btn btn-ghost" onClick={() => { setEditing(true); setSaveMsg(""); }}>
                    <IconEdit /> {t(lang, "editProfile")}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      <IconCheck size={14} color="white" /> {saving ? "..." : t(lang, "saveChanges")}
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setEditing(false); setSaveMsg(""); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {saveMsg && (
              <div style={{
                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                background: saveMsg === "success" ? "rgba(48,209,88,0.1)" : "rgba(255,69,58,0.1)",
                border: `1px solid ${saveMsg === "success" ? "rgba(48,209,88,0.25)" : "rgba(255,69,58,0.25)"}`,
                color: saveMsg === "success" ? SUCCESS : DANGER, fontSize: 13,
                display: "flex", alignItems: "center", gap: 8
              }}>
                {saveMsg === "success" ? <IconCheck /> : <IconAlertHigh />}
                {saveMsg === "success" ? (lang === "ta" ? "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : lang === "hi" ? "प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!" : "Profile updated successfully!") : (lang === "ta" ? "புதுப்பிப்பு தோல்வியடைந்தது." : lang === "hi" ? "अपडेट विफल रहा।" : "Failed to update profile.")}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20, animation: "fadeUp 0.4s ease 0.05s both" }}>
            {statCards.map(({ value, label, icon }) => (
              <div key={label} className="glass" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{value}</div>
                <div style={{ fontSize: 11.5, color: TEXT2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="glass" style={{ overflow: "hidden", animation: "fadeUp 0.4s ease 0.1s both" }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <IconActivity color={ACCENT} /> {t(lang, "recentActivity")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 12, color: TEXT3 }}>{activity.length} {lang === "ta" ? "பதிவுகள்" : lang === "hi" ? "रिकॉर्ड" : "records"}</div>
                {activity.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm("Clear all your consultation history? This cannot be undone.")) return;
                      setClearingActivity(true);
                      try {
                        await clearHistory();
                        setActivity([]);
                      } catch { alert("Failed to clear history."); }
                      finally { setClearingActivity(false); }
                    }}
                    disabled={clearingActivity}
                    className="btn btn-danger"
                    style={{ fontSize: 11.5, padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5, opacity: clearingActivity ? 0.6 : 1, cursor: clearingActivity ? "not-allowed" : "pointer" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    {clearingActivity ? "Clearing..." : (lang === "ta" ? "வரலாற்றை அழி" : lang === "hi" ? "इतिहास साफ़ करें" : "Clear History")}
                  </button>
                )}
              </div>
            </div>
            <div style={{ padding: 12 }}>
              {loadingActivity ? (
                [1, 2, 3].map((i) => (
                  <div key={i} style={{ padding: "12px 10px", borderRadius: 12, display: "flex", gap: 14, alignItems: "center", marginBottom: 4, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, width: "60%", background: "rgba(255,255,255,0.07)", borderRadius: 6, marginBottom: 6 }} />
                      <div style={{ height: 10, width: "40%", background: "rgba(255,255,255,0.05)", borderRadius: 6 }} />
                    </div>
                  </div>
                ))
              ) : activity.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: TEXT3, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, opacity: 0.4 }}>
                    <IconStethoscope size={44} color={ACCENT} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT2, marginBottom: 6 }}>{t(lang, "noActivity")}</div>
                  <div style={{ fontSize: 13 }}>{lang === "ta" ? "முதல் AI கண்டறிதலை இயக்கவும்" : lang === "hi" ? "पहला AI निदान चलाएं" : "Run your first AI diagnosis to see records here"}</div>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push("/clinic")}>
                    {t(lang, "runDiagnosis")}
                  </button>
                </div>
              ) : (
                activity.map((a, i) => (
                  <div
                    key={a.id}
                    style={{ padding: "12px 10px", borderRadius: 12, display: "flex", gap: 14, alignItems: "center", cursor: "default", transition: "background 0.15s", animation: `slideIn 0.3s ease ${i * 0.04}s both` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `rgba(${triageBg(a.triage)},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {a.triage === "HIGH" ? <IconAlertHigh /> : a.triage === "MODERATE" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WARNING} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> : <IconCheck />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.disease}</div>
                      <div style={{ fontSize: 12, color: TEXT2 }}>{a.drug} · {a.date}</div>
                    </div>
                    <div className="tag" style={{ background: `rgba(${triageBg(a.triage)},0.1)`, border: `1px solid rgba(${triageBg(a.triage)},0.2)`, color: TRIAGE_COLOR[a.triage] || SUCCESS, fontSize: 11 }}>
                      {a.triage}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logout */}
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-danger" onClick={handleLogout}>
              <IconLogout color={DANGER} /> {t(lang, "logout")}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
