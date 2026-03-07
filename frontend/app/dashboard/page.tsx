"use client";

import Navbar from "@/components/layout/navbar";
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

    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#7c3aed] text-white">

      <Navbar />

      {/* HERO */}

      <section
        id="home"
        className="h-screen flex flex-col justify-center items-center text-center px-6"
      >

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-bold mb-6"
        >
          Agentic AI Clinical System
        </motion.h1>

        <p className="text-xl text-gray-300 max-w-2xl">
          AI-powered medical diagnosis and treatment recommendations
          using multi-agent intelligence.
        </p>

      </section>

      {/* DIAGNOSIS SECTION */}

      <section
        id="diagnose"
        className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 pb-32 px-8"
      >

        {/* INPUT */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-xl">

          <h2 className="text-2xl font-semibold mb-6">
            Patient Information
          </h2>

          <input
            placeholder="Age"
            type="number"
            className="w-full p-4 rounded-xl bg-white/20 mb-4"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <textarea
            placeholder="Describe symptoms"
            className="w-full p-4 rounded-xl bg-white/20 h-32"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <button
            onClick={handleDiagnose}
            className="mt-6 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
          >
            {loading ? "Analyzing..." : "Diagnose"}
          </button>

        </div>

        {/* RESULT */}

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-xl">

          <h2 className="text-2xl font-semibold mb-6">
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
        className="max-w-5xl mx-auto text-center pb-32 px-6"
      >

        <h2 className="text-4xl font-semibold mb-6">
          Powered by Agentic AI
        </h2>

        <p className="text-gray-300 text-lg">
          Our clinical decision system combines multiple AI agents
          including patient analysis, drug recommendation, risk evaluation,
          and severity detection to assist medical professionals.
        </p>

      </section>

    </div>
  );
}