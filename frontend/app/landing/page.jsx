"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, forgotPassword } from "@/services/api";

const ACCENT = "#3b7eff";
const SUCCESS = "#30d158";
const DANGER = "#ff453a";
const TEXT = "#f2f2f7";
const TEXT2 = "rgba(242,242,247,0.6)";
const BORDER = "rgba(255,255,255,0.1)";
const SURFACE = "rgba(255,255,255,0.05)";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body { background: #030811; color: ${TEXT}; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
.bg-blobs { position: fixed; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); animation: float 18s ease-in-out infinite; }
.blob1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(59,126,255,0.22) 0%, transparent 70%); top: -250px; left: -200px; animation-delay: 0s; }
.blob2 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(94,92,230,0.16) 0%, transparent 70%); bottom: -100px; right: -150px; animation-delay: -7s; }
.blob3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(48,209,88,0.1) 0%, transparent 70%); top: 55%; left: 55%; animation-delay: -14s; }
.blob4 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(255,69,58,0.08) 0%, transparent 70%); top: 30%; left: 10%; animation-delay: -3s; }
@keyframes float { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-25px) scale(1.06); } 66% { transform: translate(-20px,30px) scale(0.94); } }
.grid-overlay { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: linear-gradient(rgba(59,126,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(59,126,255,0.035) 1px, transparent 1px);
  background-size: 60px 60px; }
.page { position: relative; z-index: 1; min-height: 100vh; }
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 52px; border-bottom: 1px solid ${BORDER}; backdrop-filter: blur(20px); background: rgba(3,8,17,0.75); position: sticky; top: 0; z-index: 100; }
.logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
.logo-icon { width: 38px; height: 38px; background: linear-gradient(135deg, ${ACCENT}, #5e5ce6); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
.nav-links { display: flex; align-items: center; gap: 32px; }
.nav-link { color: ${TEXT2}; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; cursor: pointer; }
.nav-link:hover { color: ${TEXT}; }
.nav-btns { display: flex; gap: 10px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.btn-primary { background: ${ACCENT}; color: white; padding: 11px 22px; }
.btn-primary:hover { background: #2d6fe8; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(59,126,255,0.45); }
.btn-secondary { background: ${SURFACE}; border: 1px solid ${BORDER}; color: ${TEXT}; padding: 10px 20px; }
.btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
.btn-lg { padding: 15px 34px; font-size: 15px; border-radius: 14px; }
.btn-full { width: 100%; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.hero { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 110px 24px 90px; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(59,126,255,0.1); border: 1px solid rgba(59,126,255,0.3); border-radius: 100px; padding: 8px 20px; font-size: 13px; font-weight: 600; color: ${ACCENT}; margin-bottom: 30px; animation: fadeUp 0.5s ease; }
.hero-title { font-size: clamp(32px, 7vw, 80px); font-weight: 800; letter-spacing: -2.5px; line-height: 1.06; margin-bottom: 22px; animation: fadeUp 0.5s ease 0.1s both; }
.hero-gradient { background: linear-gradient(135deg, ${ACCENT} 0%, #a78bfa 50%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-subtitle { font-size: 19px; color: ${TEXT2}; max-width: 560px; line-height: 1.7; margin-bottom: 48px; animation: fadeUp 0.5s ease 0.2s both; }
.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.5s ease 0.3s both; }
.hero-stats { display: flex; gap: 52px; margin-top: 72px; animation: fadeUp 0.5s ease 0.4s both; flex-wrap: wrap; justify-content: center; }
.stat { text-align: center; }
.stat-num { font-size: 34px; font-weight: 800; }
.stat-label { font-size: 13px; color: ${TEXT2}; margin-top: 4px; }
.features { padding: 90px 52px; max-width: 1160px; margin: 0 auto; }
.section-heading { text-align: center; margin-bottom: 60px; }
.section-tag { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; color: ${ACCENT}; text-transform: uppercase; margin-bottom: 12px; }
.section-title { font-size: 40px; font-weight: 800; letter-spacing: -1.2px; }
.section-sub { font-size: 17px; color: ${TEXT2}; margin-top: 12px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.feature-card { background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 22px; padding: 30px; transition: all 0.28s; position: relative; overflow: hidden; }
.feature-card::before { content: ''; position: absolute; inset: 0; border-radius: 22px; opacity: 0; transition: opacity 0.3s; background: linear-gradient(135deg, rgba(59,126,255,0.08), transparent); }
.feature-card:hover { border-color: rgba(59,126,255,0.35); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.feature-card:hover::before { opacity: 1; }
.feature-icon { width: 52px; height: 52px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 18px; }
.feature-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
.feature-desc { font-size: 14px; color: ${TEXT2}; line-height: 1.65; }
.how-it-works { padding: 80px 52px; max-width: 1000px; margin: 0 auto; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 56px; }
.step-card { text-align: center; padding: 32px 24px; background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 22px; position: relative; transition: all 0.25s; }
.step-card:hover { border-color: rgba(59,126,255,0.3); transform: translateY(-3px); }
.step-num { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, ${ACCENT}, #5e5ce6); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: white; margin: 0 auto 18px; }
.step-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.step-desc { font-size: 14px; color: ${TEXT2}; line-height: 1.65; }
.testimonials { padding: 80px 52px; max-width: 1000px; margin: 0 auto; }
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 56px; }
.testi-card { background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 22px; padding: 28px; transition: all 0.25s; }
.testi-card:hover { border-color: rgba(255,255,255,0.14); }
.testi-stars { color: #ffd60a; font-size: 15px; margin-bottom: 14px; }
.testi-text { font-size: 14px; color: ${TEXT2}; line-height: 1.7; margin-bottom: 18px; font-style: italic; }
.testi-author { font-size: 13px; font-weight: 600; color: ${TEXT}; }
.testi-role { font-size: 12px; color: ${TEXT2}; margin-top: 2px; }
.cta-section { padding: 80px 52px; text-align: center; }
.cta-box { max-width: 680px; margin: 0 auto; background: linear-gradient(135deg, rgba(59,126,255,0.1), rgba(94,92,230,0.08)); border: 1px solid rgba(59,126,255,0.25); border-radius: 28px; padding: 56px 48px; }
.cta-title { font-size: 38px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; }
.cta-sub { font-size: 17px; color: ${TEXT2}; margin-bottom: 36px; line-height: 1.65; }
.footer { padding: 48px; border-top: 1px solid ${BORDER}; text-align: center; color: ${TEXT2}; font-size: 13px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(16px); z-index: 500; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; padding: 16px; }
.modal { background: rgba(8,13,24,0.99); border: 1px solid ${BORDER}; border-radius: 26px; padding: 44px; width: 440px; max-width: 100%; max-height: 90vh; overflow-y: auto; animation: scaleIn 0.25s ease; }
.modal-title { font-size: 26px; font-weight: 800; letter-spacing: -0.7px; margin-bottom: 6px; }
.modal-sub { font-size: 14px; color: ${TEXT2}; margin-bottom: 30px; }
.input-group { margin-bottom: 16px; }
.input-label { font-size: 11.5px; color: ${TEXT2}; font-weight: 600; display: block; margin-bottom: 7px; letter-spacing: 0.05em; text-transform: uppercase; }
.input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid ${BORDER}; border-radius: 12px; padding: 13px 16px; color: ${TEXT}; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
.input:focus { border-color: ${ACCENT}; box-shadow: 0 0 0 3px rgba(59,126,255,0.12); }
.input::placeholder { color: rgba(242,242,247,0.3); }
.modal-footer { text-align: center; margin-top: 18px; font-size: 13px; color: ${TEXT2}; }
.modal-footer span { color: ${ACCENT}; cursor: pointer; font-weight: 600; }
.modal-footer span:hover { text-decoration: underline; }
.modal-close { position: absolute; top: 18px; right: 18px; background: rgba(255,255,255,0.07); border: none; border-radius: 50%; width: 34px; height: 34px; color: ${TEXT2}; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-close:hover { background: rgba(255,255,255,0.14); color: ${TEXT}; }
.alert { padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.alert-error { background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.25); color: ${DANGER}; }
.alert-success { background: rgba(48,209,88,0.1); border: 1px solid rgba(48,209,88,0.25); color: ${SUCCESS}; }
.badge-pulse { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${SUCCESS}; animation: pulse 2s ease-in-out infinite; }
/* Hamburger button */
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; z-index: 200; -webkit-tap-highlight-color: transparent; }
.hamburger span { display: block; width: 22px; height: 2px; background: ${TEXT}; border-radius: 2px; transition: all 0.3s; }
/* Mobile nav overlay */
.mobile-nav-overlay { display: none; position: fixed; inset: 0; background: rgba(3,8,17,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 32px; animation: fadeIn 0.25s ease; padding: 40px 20px; }
.mobile-nav-overlay.open { display: flex; }
.mobile-nav-link { color: ${TEXT2}; font-size: 22px; font-weight: 600; text-decoration: none; cursor: pointer; transition: color 0.2s; -webkit-tap-highlight-color: transparent; }
.mobile-nav-link:hover, .mobile-nav-link:active { color: ${TEXT}; }
.mobile-nav-btns { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 300px; margin-top: 12px; }
/* Password grid responsive */
.pw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
@keyframes fadeUp { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn { from { opacity:0; transform: scale(0.93); } to { opacity:1; transform: scale(1); } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── Tablet (≤900px) ── */
@media (max-width: 900px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .section-title { font-size: 32px; }
  .hero-stats { gap: 32px; }
  .features, .how-it-works, .testimonials { padding-left: 28px; padding-right: 28px; }
  .cta-section { padding-left: 28px; padding-right: 28px; }
  .navbar { padding: 16px 28px; }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .navbar { padding: 14px 18px; }
  .nav-links { display: none; }
  .nav-btns { display: none; }
  .hamburger { display: flex; }
  .hero { padding: 80px 18px 60px; }
  .hero-subtitle { font-size: 16px; }
  .hero-stats { gap: 20px; margin-top: 48px; }
  .stat-num { font-size: 26px; }
  .features { padding: 60px 18px; }
  .features-grid { grid-template-columns: 1fr; gap: 16px; }
  .how-it-works { padding: 60px 18px; }
  .steps { grid-template-columns: 1fr; gap: 16px; margin-top: 36px; }
  .testimonials { padding: 60px 18px; }
  .testi-grid { grid-template-columns: 1fr; gap: 16px; margin-top: 36px; }
  .cta-section { padding: 60px 18px; }
  .cta-box { padding: 36px 22px; border-radius: 20px; }
  .cta-title { font-size: 26px; }
  .cta-sub { font-size: 15px; }
  .footer { padding: 32px 18px; }
  .section-title { font-size: 26px; letter-spacing: -0.5px; }
  .section-sub { font-size: 15px; }
  .section-heading { margin-bottom: 36px; }
  .modal { padding: 28px 20px; border-radius: 20px; }
  .modal-title { font-size: 22px; }
  .btn-lg { padding: 14px 24px; font-size: 14px; }
  .pw-grid { grid-template-columns: 1fr; }
}

/* ── Small phones (≤480px) ── */
@media (max-width: 480px) {
  .hero { padding: 70px 14px 50px; }
  .hero-badge { font-size: 11px; padding: 6px 14px; }
  .hero-stats { gap: 14px; }
  .stat-num { font-size: 22px; }
  .stat-label { font-size: 11px; }
  .features { padding: 50px 14px; }
  .how-it-works { padding: 50px 14px; }
  .testimonials { padding: 50px 14px; }
  .cta-section { padding: 50px 14px; }
  .footer { padding: 28px 14px; }
  .modal { padding: 24px 16px; }
}
`;

const FEATURES = [
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>, title: "10-Agent AI Pipeline", desc: "Multi-stage clinical reasoning analyzes your symptoms through 10 specialized AI agents to provide accurate, contextual diagnoses.", grad: "linear-gradient(135deg,rgba(59,126,255,0.15),rgba(94,92,230,0.05))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>, title: "Personalized Medications", desc: "Get specific medication recommendations with dosages and duration based on your age, allergies, and pre-existing conditions.", grad: "linear-gradient(135deg,rgba(48,209,88,0.12),rgba(0,200,150,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, title: "Full Treatment Plans", desc: "Receive step-by-step treatment plans following evidence-based clinical protocols for 14+ disease categories.", grad: "linear-gradient(135deg,rgba(255,214,10,0.12),rgba(255,159,10,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>, title: "Lifestyle Guidance", desc: "Personalized diet, exercise, sleep, and stress management recommendations tailored to your diagnosis.", grad: "linear-gradient(135deg,rgba(48,209,88,0.1),rgba(0,150,100,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bf5af2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: "AI Medical Chat", desc: "Chat with your AI doctor in English, Tamil, or Hindi. Ask anything — get clear, empathetic guidance instantly.", grad: "linear-gradient(135deg,rgba(175,82,222,0.14),rgba(100,60,255,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff453a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>, title: "Voice Diagnosis", desc: "Speak your symptoms naturally in English, Tamil, or Hindi. AI understands and auto-starts your diagnosis immediately.", grad: "linear-gradient(135deg,rgba(255,69,58,0.12),rgba(255,100,80,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, title: "Risk Assessment", desc: "Real-time triage scoring identifies HIGH, MODERATE, or LOW risk situations and knows when to urgently recommend care.", grad: "linear-gradient(135deg,rgba(255,149,0,0.12),rgba(255,100,0,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Drug Safety Checks", desc: "Automatic contraindication checks prevent dangerous drug interactions based on your allergies and medical conditions.", grad: "linear-gradient(135deg,rgba(59,126,255,0.12),rgba(0,180,255,0.04))" },
  { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title: "Clinical Reports", desc: "Download professional, beautifully formatted PDF medical reports for every consultation you complete.", grad: "linear-gradient(135deg,rgba(94,92,230,0.14),rgba(60,80,255,0.04))" },
];

const STEPS = [
  { num: "1", emoji: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>, title: "Share Your Symptoms", desc: "Type or speak your symptoms in English, Tamil, or Hindi. Include your age, allergies, and any existing conditions." },
  { num: "2", emoji: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: "AI Analyzes & Diagnoses", desc: "10 specialized AI agents work together to diagnose, assess risk, check drug safety, and build your treatment plan." },
  { num: "3", emoji: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>, title: "Get Your Full Plan", desc: "Review your diagnosis, medications, lifestyle recommendations, and download your clinical report." },
];

const TESTIMONIALS = [
  { stars: "★★★★★", text: "\"I had a scary fever and rash at 2am with no doctor available. This AI told me exactly what I had, gave me medication names, and told me when to go to the ER. It was a lifesaver.\"", author: "Meena R.", role: "Chennai, Tamil Nadu" },
  { stars: "★★★★★", text: "\"I spoke in Tamil and it responded in Tamil. The medications and dosages were exactly what my doctor later prescribed. Unbelievable accuracy for an AI.\"", author: "Arjun K.", role: "Coimbatore, Tamil Nadu" },
  { stars: "★★★★★", text: "\"मुझे हिंदी में जवाब मिला और दवाइयों की पूरी जानकारी भी। यह बहुत उपयोगी है जहाँ डॉक्टर नहीं हैं।\"", author: "Ramesh S.", role: "Jaipur, Rajasthan" },
];

export default function LandingPage() {
  const router = useRouter();
  const [modal, setModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
      setSuccess("Welcome back! Redirecting to your dashboard...");
      await new Promise(r => setTimeout(r, 700));
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
      await registerUser(form.name, form.email, form.password, "patient");
      setSuccess("Account created! Taking you to your AI Doctor...");
      await new Promise(r => setTimeout(r, 800));
      router.push("/clinic");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const [forgotForm, setForgotForm] = useState({ email: "", newPassword: "", confirmNewPassword: "" });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!forgotForm.email) { setError("Please enter your email address."); return; }
    if (!forgotForm.newPassword || forgotForm.newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (forgotForm.newPassword !== forgotForm.confirmNewPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await forgotPassword(forgotForm.email, forgotForm.newPassword);
      setSuccess("Password reset successfully! Taking you to the clinic...");
      await new Promise(r => setTimeout(r, 800));
      router.push("/clinic");
    } catch (err) {
      setError(err?.response?.data?.detail || "Reset failed. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setError("");
    setSuccess("");
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setForgotForm({ email: "", newPassword: "", confirmNewPassword: "" });
  };

  return (
    <>
      <style>{css}</style>
      <div className="bg-blobs">
        <div className="blob blob1" /><div className="blob blob2" /><div className="blob blob3" /><div className="blob blob4" />
      </div>
      <div className="grid-overlay" />
      <div className="page">
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            my<span style={{ color: ACCENT, marginLeft: 1 }}>Doctor</span>
          </div>
          <div className="nav-links">
            <span className="nav-link" onClick={() => {}}>Features</span>
            <span className="nav-link" onClick={() => {}}>How It Works</span>
            <span className="nav-link" onClick={() => {}}>Reviews</span>
          </div>
          <div className="nav-btns">
            <button className="btn btn-secondary" onClick={() => { closeModal(); setModal("login"); }}>Sign In</button>
            <button className="btn btn-primary" onClick={() => { closeModal(); setModal("signup"); }}>Get Started Free</button>
          </div>
          {/* Hamburger — mobile only */}
          <button className="hamburger" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* Mobile nav overlay */}
        <div className={`mobile-nav-overlay${mobileMenuOpen ? " open" : ""}`}>
          <button onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 38, height: 38, color: TEXT, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <span className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</span>
          <span className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>How It Works</span>
          <span className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Reviews</span>
          <div className="mobile-nav-btns">
            <button className="btn btn-secondary btn-full" onClick={() => { setMobileMenuOpen(false); closeModal(); setModal("login"); }}>Sign In</button>
            <button className="btn btn-primary btn-full" onClick={() => { setMobileMenuOpen(false); closeModal(); setModal("signup"); }}>Get Started Free</button>
          </div>
        </div>

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <span className="badge-pulse" />
            AI-Powered Personal Medical Assistant
          </div>
          <h1 className="hero-title">
            Your Personal<br />
            <span className="hero-gradient">AI Doctor</span><br />
            <span style={{ fontSize: "0.65em", letterSpacing: "-1px", color: TEXT2 }}>Available 24/7, In Your Language</span>
          </h1>
          <p className="hero-subtitle">
            Get instant, personalized medical guidance — diagnosis, medications, treatment plans, and lifestyle advice — in English, Tamil, or Hindi. No appointment needed.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => { closeModal(); setModal("signup"); }}>Get Started Free <svg style={{display:"inline",verticalAlign:"middle",marginLeft:4}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push("/clinic")}>View Demo →</button>
          </div>
          <div className="hero-stats">
            {[["14+", "Diseases Covered"], ["10", "AI Agents"], ["3", "Languages"], ["<3s", "Diagnosis Time"]].map(([n, l]) => (
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
            <div className="section-tag">Everything You Need</div>
            <div className="section-title">Like A Real Doctor, In Your Pocket</div>
            <div className="section-sub">Comprehensive AI-powered medical support designed for patients who need answers — anytime, anywhere</div>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title} style={{ background: f.grad }}>
                <div className="feature-icon" style={{ background: "rgba(255,255,255,0.07)" }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <div className="section-heading">
            <div className="section-tag">Simple Process</div>
            <div className="section-title">How It Works</div>
            <div className="section-sub">Get your complete medical assessment in under 30 seconds</div>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num">{s.emoji}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials">
          <div className="section-heading">
            <div className="section-tag">Real Stories</div>
            <div className="section-title">Patients Love myDoctor</div>
            <div className="section-sub">Helping people in moments when a doctor isn't available</div>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="testi-card" key={i}>
                <div className="testi-stars">{t.stars}</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">{t.author}</div>
                <div className="testi-role">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-box">
            <div className="cta-title">Ready to Meet Your<br /><span className="hero-gradient">AI Doctor?</span></div>
            <div className="cta-sub">Free to use. No credit card. Works in English, Tamil & Hindi.<br />Start your first diagnosis in under 60 seconds.</div>
            <button className="btn btn-primary btn-lg" onClick={() => { closeModal(); setModal("signup"); }} style={{ margin: "0 auto", display: "flex" }}>🩺 Start Free — It Takes 60 Seconds</button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>🩺 MedAI Doctor</div>
          <div>For personal health guidance. Not a replacement for emergency medical care.</div>
          <div style={{ marginTop: 8, color: "rgba(242,242,247,0.3)", fontSize: 12 }}>© 2026 MedAI · Built with FastAPI & Next.js · Available in English, தமிழ், हिंदी</div>
        </footer>

        {/* Auth Modal */}
        {modal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="modal" style={{ position: "relative" }}>
              <button className="modal-close" onClick={closeModal}>✕</button>

              {modal === "login" ? (
                <>
                  <div style={{ fontSize: 42, marginBottom: 12 }}>🩺</div>
                  <div className="modal-title">Welcome back</div>
                  <div className="modal-sub">Sign in to your personal AI doctor</div>
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  {success && <div className="alert alert-success">✅ {success}</div>}
                  <form onSubmit={handleLogin}>
                    <div className="input-group">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input className="input" type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">PASSWORD</label>
                      <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                    </div>
                    <div style={{ textAlign: "right", marginBottom: 20 }}>
                      <span style={{ fontSize: 13, color: ACCENT, cursor: "pointer" }} onClick={() => { setError(""); setSuccess(""); setForgotForm({ email: form.email, newPassword: "", confirmNewPassword: "" }); setModal("forgot"); }}>Forgot password?</span>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ height: 48 }} disabled={loading}>
                      {loading ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Sign In →"}
                    </button>
                  </form>
                  <div className="modal-footer">Don't have an account? <span onClick={() => setModal("signup")}>Create one free</span></div>
                </>
              ) : modal === "forgot" ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#3b7eff,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  </div>
                  <div className="modal-title">Reset Password</div>
                  <div className="modal-sub">Enter your email and choose a new password</div>
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  {success && <div className="alert alert-success">✅ {success}</div>}
                  <form onSubmit={handleForgotPassword}>
                    <div className="input-group">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input className="input" type="email" placeholder="your@email.com" value={forgotForm.email} onChange={e => { setForgotForm({ ...forgotForm, email: e.target.value }); setError(""); }} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">NEW PASSWORD</label>
                      <input className="input" type="password" placeholder="Min 8 characters" value={forgotForm.newPassword} onChange={e => { setForgotForm({ ...forgotForm, newPassword: e.target.value }); setError(""); }} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">CONFIRM NEW PASSWORD</label>
                      <input className="input" type="password" placeholder="Repeat new password" value={forgotForm.confirmNewPassword} onChange={e => { setForgotForm({ ...forgotForm, confirmNewPassword: e.target.value }); setError(""); }} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ height: 48 }} disabled={loading}>
                      {loading ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Reset Password & Sign In →"}
                    </button>
                  </form>
                  <div className="modal-footer">Remember your password? <span onClick={() => setModal("login")}>Sign in</span></div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 42, marginBottom: 12 }}>🏥</div>
                  <div className="modal-title">Create your account</div>
                  <div className="modal-sub">Your personal AI doctor, available 24/7</div>
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  {success && <div className="alert alert-success">✅ {success}</div>}
                  <form onSubmit={handleSignup}>
                    <div className="input-group">
                      <label className="input-label">YOUR FULL NAME</label>
                      <input className="input" type="text" name="name" placeholder="e.g. Karthick R." value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input className="input" type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="pw-grid">
                      <div className="input-group">
                        <label className="input-label">PASSWORD</label>
                        <input className="input" type="password" name="password" placeholder="Min 8 chars" value={form.password} onChange={handleChange} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">CONFIRM PASSWORD</label>
                        <input className="input" type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(242,242,247,0.4)", marginBottom: 18, lineHeight: 1.6, padding: "10px 12px", background: "rgba(59,126,255,0.06)", borderRadius: 10, border: "1px solid rgba(59,126,255,0.15)" }}>
                      🛡️ This service is for <strong>patients and individuals</strong> seeking personal health guidance. All data is private to your account.
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ height: 48 }} disabled={loading}>
                      {loading ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "Create My Account 🚀"}
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
