"use client";
import { useState } from "react";
import { diagnosePatient } from "@/services/api";
import { motion } from "framer-motion";

export default function Dashboard() {

  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDiagnose = async () => {

    setLoading(true);

    try {

      const data = await diagnosePatient(Number(age), symptoms);

      setResult(data);

    } catch (error) {

      alert("Backend error");

    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#7c3aed] text-white overflow-x-hidden">

      {/* HERO */}

      <section
        id="home"
        className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 py-16"
      >

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-semibold mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            AI-Powered Clinical Diagnosis System
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          my<span className="text-blue-400">Doctor</span>
        </motion.h1>

        <p className="text-base sm:text-xl text-gray-300 max-w-2xl px-2">
          AI-powered medical diagnosis, treatment plans, and drug safety assessments
          using 10 specialized multi-agent clinical intelligence systems.
        </p>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-8 mt-12">
          {[
            {icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b7eff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, value: "10K+", label: "Patients Helped"},
            {icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, value: "94%", label: "Diagnosis Accuracy"},
            {icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd60a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, value: "10", label: "AI Agents Active"},
            {icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bf5af2" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, value: "3", label: "Languages"},
          ].map(({icon, value, label}) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </motion.div>

      </section>

      {/* DIAGNOSIS SECTION */}

      <section
        id="diagnose"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 px-4 sm:px-8"
      >

        {/* INPUT */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl">

          <h2 className="text-xl sm:text-2xl font-semibold mb-6">
            Patient Information
          </h2>

          <input
            placeholder="Age"
            type="number"
            className="w-full p-4 rounded-xl bg-white/20 mb-4 text-white placeholder-white/50 outline-none"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <textarea
            placeholder="Describe symptoms"
            className="w-full p-4 rounded-xl bg-white/20 h-32 text-white placeholder-white/50 outline-none resize-none"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <button
            onClick={handleDiagnose}
            className="mt-6 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold min-h-[48px]"
          >
            {loading ? "Analyzing..." : "Diagnose"}
          </button>

        </div>

        {/* RESULT */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl">

          <h2 className="text-xl sm:text-2xl font-semibold mb-6">
            Diagnosis Result
          </h2>

          {result ? (

            <div className="space-y-4">

              <p>
                <b>Disease:</b>{" "}
                {result.treatment?.predicted_disease || "N/A"}
              </p>

              <p>
                <b>Probability:</b>{" "}
                {result.patient_profile?.disease_probabilities?.[0]?.probability
                  ? (result.patient_profile.disease_probabilities[0].probability * 100).toFixed(1) + "%"
                  : "N/A"}
              </p>

              <p>
                <b>Drug:</b>{" "}
                {result.treatment?.recommended_drug || "N/A"}
              </p>

              <p>
                <b>Dosage:</b>{" "}
                {result.treatment?.dosage || "N/A"}
              </p>

              <p>
                <b>Triage:</b>{" "}
                {result.triage?.level || "N/A"}
              </p>

            </div>

          ) : (

            <p className="text-gray-400">
              Run diagnosis to view results.
            </p>

          )}

        </div>

      </section>

      {/* ABOUT */}

      <section
        id="about"
        className="max-w-5xl mx-auto text-center pb-20 px-4 sm:px-6"
      >

        <h2 className="text-3xl sm:text-4xl font-semibold mb-6">
          Powered by Agentic AI
        </h2>

        <p className="text-gray-300 text-base sm:text-lg">
          Our clinical decision system combines multiple AI agents
          including patient analysis, drug recommendation, risk evaluation,
          and severity detection to assist medical professionals.
        </p>

      </section>

    </div>
  );
}
