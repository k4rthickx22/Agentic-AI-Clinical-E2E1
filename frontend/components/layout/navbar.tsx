"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 z-50"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-4">

          <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b7eff,#5e5ce6)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            my<span style={{ color: "#3b7eff" }}>Doctor</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex gap-8 text-gray-300">
            <a href="#home" className="hover:text-white transition">Home</a>
            <a href="#diagnose" className="hover:text-white transition">Diagnose</a>
            <a href="#about" className="hover:text-white transition">About</a>
          </div>

          {/* Hamburger – mobile only */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle navigation"
          >
            <span className="block w-6 h-0.5 bg-white rounded transition-all" />
            <span className="block w-6 h-0.5 bg-white rounded transition-all" />
            <span className="block w-6 h-0.5 bg-white rounded transition-all" />
          </button>

        </div>
      </motion.div>

      {/* Mobile dropdown */}
      {open && (
        <div className="fixed top-[65px] left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 z-40 flex flex-col items-start px-6 py-4 gap-4 text-gray-300 md:hidden">
          <a href="#home" className="hover:text-white transition text-lg py-1" onClick={() => setOpen(false)}>Home</a>
          <a href="#diagnose" className="hover:text-white transition text-lg py-1" onClick={() => setOpen(false)}>Diagnose</a>
          <a href="#about" className="hover:text-white transition text-lg py-1" onClick={() => setOpen(false)}>About</a>
        </div>
      )}
    </>
  );
}