"use client";

import Link from "next/link";
import { LayoutDashboard, History, FileText } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-black/30 backdrop-blur-xl text-white p-8 flex flex-col shadow-xl">

      <h1 className="text-2xl font-bold mb-10 tracking-wide">
        🧠 AI Clinic
      </h1>

      <nav className="space-y-6 text-lg">

        <Link href="/dashboard" className="flex items-center gap-3 hover:text-blue-300">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link href="/history" className="flex items-center gap-3 hover:text-blue-300">
          <History size={20} />
          Patient History
        </Link>

        <Link href="/reports" className="flex items-center gap-3 hover:text-blue-300">
          <FileText size={20} />
          Reports
        </Link>

      </nav>
    </div>
  );
}