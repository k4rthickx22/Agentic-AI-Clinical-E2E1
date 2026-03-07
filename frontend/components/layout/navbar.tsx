"use client";

import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        <div className="text-xl font-semibold tracking-tight">
          🧠 AI Clinic
        </div>

        <div className="flex gap-8 text-gray-300">

          <a href="#home" className="hover:text-white transition">
            Home
          </a>

          <a href="#diagnose" className="hover:text-white transition">
            Diagnose
          </a>

          <a href="#about" className="hover:text-white transition">
            About
          </a>

        </div>

      </div>
    </motion.div>
  );
}