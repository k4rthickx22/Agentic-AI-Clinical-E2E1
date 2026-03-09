"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/services/api";

// ── Design tokens ──────────────────────────────────────────────
const ACCENT = "#3b7eff";
const SUCCESS = "#30d158";
const DANGER = "#ff453a";
const TEXT = "#f2f2f7";
const TEXT2 = "rgba(242,242,247,0.6)";
const BORDER = "rgba(255,255,255,0.1)";
const SURFACE = "rgba(255,255,255,0.05)";

// ── CSS ─────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #030811; color: ${TEXT}; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

/* Animated background blobs */
.bg-blobs { position: fixed; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 18s ease-in-out infinite; }
.blob1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,126,255,0.18) 0%, transparent 70%); top: -200px; left: -200px; animation-delay: 0s; }
.blob2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(94,92,230,0.14) 0%, transparent 70%); bottom: -100px; right: -100px; animation-delay: -6s; }
.blob3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(48,209,88,0.1) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -12s; }
@keyframes float { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.05); } 66% { transform: translate(-20px,30px) scale(0.95); } }

/* Grid pattern overlay */
.grid-overlay { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: linear-gradient(rgba(59,126,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,126,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px; }

.page { position: relative; z-index: 1; min-height: 100vh; }

/* Navbar */
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; border-bottom: 1px solid ${BORDER}; backdrop-filter: blur(20px); background: rgba(3,8,17,0.7); position: sticky; top: 0; z-index: 100; }
.logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
.logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, ${ACCENT}, #5e5ce6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
.nav-links { display: flex; align-items: center; gap: 30px; }
.nav-link { color: ${TEXT2}; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; cursor: pointer; }
.nav-link:hover { color: ${TEXT}; }
.nav-btns { display: flex; gap: 10px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-primary { background: ${ACCENT}; color: white; padding: 11px 22px; }
.btn-primary:hover { background: #2d6fe8; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,126,255,0.4); }
.btn-secondary { background: ${SURFACE}; border: 1px solid ${BORDER}; color: ${TEXT}; padding: 10px 20px; }
.btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); }
.btn-lg { padding: 15px 32px; font-size: 15px; border-radius: 14px; }
.btn-success { background: ${SUCCESS}; color: #000; }
.btn-success:hover { background: #28c74e; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(48,209,88,0.4); }
.btn-full { width: 100%; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

/* Hero */
.hero { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 100px 24px 80px; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(59,126,255,0.1); border: 1px solid rgba(59,126,255,0.25); border-radius: 100px; padding: 8px 18px; font-size: 13px; font-weight: 600; color: ${ACCENT}; margin-bottom: 28px; animation: fadeUp 0.5s ease; }
.hero-title { font-size: clamp(44px, 7vw, 76px); font-weight: 800; letter-spacing: -2px; line-height: 1.08; margin-bottom: 22px; animation: fadeUp 0.5s ease 0.1s both; }
.hero-gradient { background: linear-gradient(135deg, ${ACCENT}, #a78bfa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 18px; color: ${TEXT2}; max-width: 540px; line-height: 1.65; margin-bottom: 44px; animation: fadeUp 0.5s ease 0.2s both; }
.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.5s ease 0.3s both; }
.hero-stats { display: flex; gap: 48px; margin-top: 70px; animation: fadeUp 0.5s ease 0.4s both; }
.stat { text-align: center; }
.stat-num { font-size: 32px; font-weight: 800; }
.stat-label { font-size: 13px; color: ${TEXT2}; margin-top: 4px; }

/* Features */
.features { padding: 80px 48px; max-width: 1140px; margin: 0 auto; }
.section-heading { text-align: center; margin-bottom: 56px; }
.section-tag { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; color: ${ACCENT}; text-transform: uppercase; margin-bottom: 12px; }
.section-title { font-size: 38px; font-weight: 800; letter-spacing: -1px; }
.section-sub { font-size: 16px; color: ${TEXT2}; margin-top: 12px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feature-card { background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 20px; padding: 28px; transition: all 0.25s; }
.feature-card:hover { border-color: rgba(59,126,255,0.3); transform: translateY(-3px); background: rgba(255,255,255,0.07); }
.feature-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
.feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.feature-desc { font-size: 13.5px; color: ${TEXT2}; line-height: 1.6; }

/* Auth modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); z-index: 500; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
.modal { background: rgba(10,15,28,0.98); border: 1px solid ${BORDER}; border-radius: 24px; padding: 40px; width: 420px; max-width: 92vw; animation: scaleIn 0.25s ease; }
.modal-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
.modal-sub { font-size: 14px; color: ${TEXT2}; margin-bottom: 28px; }
.input-group { margin-bottom: 16px; }
.input-label { font-size: 12px; color: ${TEXT2}; font-weight: 600; display: block; margin-bottom: 7px; letter-spacing: 0.04em; }
.input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid ${BORDER}; border-radius: 12px; padding: 13px 16px; color: ${TEXT}; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
.input:focus { border-color: ${ACCENT}; }
.input::placeholder { color: rgba(242,242,247,0.3); }
.modal-footer { text-align: center; margin-top: 18px; font-size: 13px; color: ${TEXT2}; }
.modal-footer span { color: ${ACCENT}; cursor: pointer; font-weight: 600; }
.modal-footer span:hover { text-decoration: underline; }
.modal-close { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; width: 32px; height: 32px; color: ${TEXT2}; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.modal-close:hover { background: rgba(255,255,255,0.14); color: ${TEXT}; }
.alert { padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.alert-error { background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.25); color: ${DANGER}; }
.alert-success { background: rgba(48,209,88,0.1); border: 1px solid rgba(48,209,88,0.25); color: ${SUCCESS}; }
.divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: ${TEXT2}; font-size: 12px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: ${BORDER}; }
.social-btn { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid ${BORDER}; color: ${TEXT}; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
.social-btn:hover { background: rgba(255,255,255,0.09); }

/* Footer */
.footer { padding: 48px; border-top: 1px solid ${BORDER}; text-align: center; color: ${TEXT2}; font-size: 13px; }

@keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn { from { opacity:0; transform: scale(0.94); } to { opacity:1; transform: scale(1); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const FEATURES = [
  { icon: "🧠", title: "10-Agent AI Pipeline", desc: "Multi-stage clinical reasoning using GPT-4o and specialized medical agents for accurate diagnosis.", grad: "linear-gradient(135deg,rgba(59,126,255,0.15),rgba(94,92,230,0.08))" },
  { icon: "💊", title: "Smart Drug Safety", desc: "Real-time contraindication checks for allergies, age, and organ conditions before prescribing.", grad: "linear-gradient(135deg,rgba(48,209,88,0.12),rgba(0,200,150,0.06))" },
  { icon: "📋", title: "Clinical Protocols", desc: "Evidence-based treatment protocols aligned with WHO guidelines for 14+ disease categories.", grad: "linear-gradient(135deg,rgba(255,214,10,0.12),rgba(255,159,10,0.06))" },
  { icon: "🩺", title: "Personalized Diagnosis", desc: "AI considers age, gender, allergies, and pre-existing conditions for a truly personalized assessment.", grad: "linear-gradient(135deg,rgba(255,69,58,0.12),rgba(255,100,80,0.06))" },
  { icon: "💬", title: "AI Medical Chat", desc: "Interactive multi-turn chat with a clinical AI assistant for follow-up questions and guidance.", grad: "linear-gradient(135deg,rgba(175,82,222,0.14),rgba(100,60,255,0.06))" },
  { icon: "📄", title: "PDF Clinical Reports", desc: "Download professional, beautifully formatted medical reports for each patient consultation.", grad: "linear-gradient(135deg,rgba(59,126,255,0.12),rgba(0,180,255,0.06))" },
];

export default function LandingPage() {
  const router = useRouter();
  const [modal, setModal] = useState(null); // 'login' | 'signup'
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "doctor" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      setSuccess("Logged in successfully! Redirecting...");
      await new Promise(r => setTimeout(r, 600));
      router.push("/clinic");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password, form.role);
      setSuccess("Account created! Redirecting to dashboard...");
      await new Promise(r => setTimeout(r, 700));
      router.push("/clinic");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => { setModal(null); setError(""); setSuccess(""); setForm({ name: "", email: "", password: "", confirmPassword: "", role: "doctor" }); };

  return (
    <>
      <style>{css}</style>
      <div className="bg-blobs">
        <div className="blob blob1" /><div className="blob blob2" /><div className="blob blob3" />
      </div>
      <div className="grid-overlay" />
      <div className="page">
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">🩺</div>
            AI Clinic <span style={{ color: ACCENT, marginLeft: 2 }}>DSS</span>
          </div>
          <div className="nav-links">
            <span className="nav-link" onClick={() => {}}>Features</span>
            <span className="nav-link" onClick={() => {}}>How It Works</span>
            <span className="nav-link" onClick={() => {}}>About</span>
          </div>
          <div className="nav-btns">
            <button className="btn btn-secondary" onClick={() => { closeModal(); setModal("login"); }}>Sign In</button>
            <button className="btn btn-primary" onClick={() => { closeModal(); setModal("signup"); }}>Get Started</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: SUCCESS, display: "inline-block" }} />
            AI-Powered Clinical Decision Support System
          </div>
          <h1 className="hero-title">
            Your Personal<br />
            <span className="hero-gradient">AI Doctor</span>
          </h1>
          <p className="hero-subtitle">A world-class clinical AI system that analyzes symptoms, conditions, and allergies to deliver accurate diagnoses, safe drug recommendations, and personalized care plans.</p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => { closeModal(); setModal("signup"); }}>🚀 Start Free Diagnosis</button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push("/clinic")}>View Demo →</button>
          </div>
          <div className="hero-stats">
            {[["14+", "Disease Models"], ["10", "AI Agents"], ["99%", "Safety Checks"], ["<3s", "Diagnosis Time"]].map(([n, l]) => (
              <div className="stat" key={l}>
                <div className="stat-num" style={{ color: ACCENT }}>{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="section-heading">
            <div className="section-tag">What We Offer</div>
            <div className="section-title">Built for Modern Medicine</div>
            <div className="section-sub">A comprehensive toolkit powered by the latest in medical AI</div>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title} style={{ background: f.grad }}>
                <div className="feature-icon" style={{ background: "rgba(255,255,255,0.06)" }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 16 }}>🩺 AI Clinic DSS v2.0</div>
          <div>© 2026 AI Clinical Decision Support System. AI-generated content is for clinical support only.</div>
          <div style={{ marginTop: 8, color: "rgba(242,242,247,0.3)", fontSize: 12 }}>Built with ❤️, FastAPI & Next.js</div>
        </footer>

        {/* Auth Modal */}
        {modal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="modal" style={{ position: "relative" }}>
              <button className="modal-close" onClick={closeModal}>✕</button>

              {modal === "login" ? (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🩺</div>
                  <div className="modal-title">Welcome back</div>
                  <div className="modal-sub">Sign in to your clinical dashboard</div>
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  {success && <div className="alert alert-success">✅ {success}</div>}
                  <form onSubmit={handleLogin}>
                    <div className="input-group">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input className="input" type="email" name="email" placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">PASSWORD</label>
                      <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                    </div>
                    <div style={{ textAlign: "right", marginBottom: 18 }}>
                      <span style={{ fontSize: 13, color: ACCENT, cursor: "pointer" }}>Forgot password?</span>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                      {loading ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Sign In →"}
                    </button>
                  </form>
                  <div className="modal-footer">Don't have an account? <span onClick={() => setModal("signup")}>Sign up free</span></div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
                  <div className="modal-title">Create account</div>
                  <div className="modal-sub">Start your AI clinical journey today</div>
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  {success && <div className="alert alert-success">✅ {success}</div>}
                  <form onSubmit={handleSignup}>
                    <div className="input-group">
                      <label className="input-label">FULL NAME</label>
                      <input className="input" type="text" name="name" placeholder="Dr. John Smith" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input className="input" type="email" name="email" placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">ROLE</label>
                      <select className="input" name="role" value={form.role} onChange={handleChange} style={{ cursor: "pointer" }}>
                        <option value="doctor">Doctor / Clinician</option>
                        <option value="resident">Resident / Intern</option>
                        <option value="nurse">Nurse / Paramedic</option>
                        <option value="patient">Patient / Self-use</option>
                      </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="input-group">
                        <label className="input-label">PASSWORD</label>
                        <input className="input" type="password" name="password" placeholder="Min 8 chars" value={form.password} onChange={handleChange} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">CONFIRM PASSWORD</label>
                        <input className="input" type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(242,242,247,0.4)", marginBottom: 16, lineHeight: 1.5 }}>
                      By creating an account you agree to our <span style={{ color: ACCENT, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: ACCENT, cursor: "pointer" }}>Privacy Policy</span>.
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                      {loading ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Create Account 🚀"}
                    </button>
                  </form>
                  <div className="modal-footer">Already have an account? <span onClick={() => setModal("login")}>Sign in</span></div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
