"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateProfile, getUserActivity, logout, getStoredUser } from "@/services/api";
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

export default function ProfilePage() {
  const router = useRouter();
  const [lang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en"
  );
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");

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
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await updateProfile(editName);
      setUser((u) => ({ ...u, name: res.name }));
      const stored = getStoredUser();
      if (stored) localStorage.setItem("auth_user", JSON.stringify({ ...stored, name: res.name }));
      setSaveMsg("Profile updated successfully!");
      setEditing(false);
    } catch {
      setSaveMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";
  const lastLogin = user.last_login
    ? new Date(user.last_login).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "N/A";

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
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:inherit; }
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
            ← Back to Clinic
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
                      🙋 Patient Account
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
                    <div>
                      <label style={{ fontSize: 11, color: TEXT3, fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>FULL NAME</label>
                      <input
                        className="field"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!editing ? (
                  <button className="btn btn-ghost" onClick={() => { setEditing(true); setSaveMsg(""); }}>
                    ✏️ {t(lang, "editProfile")}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : `✓ ${t(lang, "saveChanges")}`}
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setEditing(false); setSaveMsg(""); }}>✕</button>
                  </>
                )}
              </div>
            </div>

            {saveMsg && (
              <div style={{
                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                background: saveMsg.includes("success") ? "rgba(48,209,88,0.1)" : "rgba(255,69,58,0.1)",
                border: `1px solid ${saveMsg.includes("success") ? "rgba(48,209,88,0.25)" : "rgba(255,69,58,0.25)"}`,
                color: saveMsg.includes("success") ? SUCCESS : DANGER, fontSize: 13
              }}>
                {saveMsg.includes("success") ? "✅" : "⚠️"} {saveMsg}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, animation: "fadeUp 0.4s ease 0.05s both" }}>
            {[
              [`${activity.length}`, "Total Consultations", "🩺"],
              [joinDate, t(lang, "memberSince"), "📅"],
              [lastLogin, t(lang, "lastLogin"), "🕑"],
            ].map(([v, l, ic]) => (
              <div key={l} className="glass" style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{v}</div>
                <div style={{ fontSize: 11.5, color: TEXT2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="glass" style={{ overflow: "hidden", animation: "fadeUp 0.4s ease 0.1s both" }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>🕑 {t(lang, "recentActivity")}</div>
              <div style={{ fontSize: 12, color: TEXT3 }}>{activity.length} record{activity.length !== 1 ? "s" : ""}</div>
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
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🩺</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT2, marginBottom: 6 }}>{t(lang, "noActivity")}</div>
                  <div style={{ fontSize: 13 }}>Run your first AI diagnosis to see records here</div>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push("/clinic")}>
                    Start Diagnosis
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
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `rgba(${triageBg(a.triage)},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {a.triage === "HIGH" ? "🚨" : a.triage === "MODERATE" ? "⚠️" : "✅"}
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
              🚪 {t(lang, "logout")}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
