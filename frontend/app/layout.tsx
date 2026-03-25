import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedAI Doctor – AI-Powered Personal Medical Assistant",
  description: "Get instant AI-powered medical diagnosis, medications, treatment plans and lifestyle advice in English, Tamil, or Hindi.",
};

// ── THIS IS THE CRITICAL FIX ──────────────────────────────────────────────
// Without this, iOS Safari renders the page at 980px, breaking all
// @media (max-width: 768px) queries and making the site non-responsive.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,         // prevents iOS auto-zoom on form focus
  userScalable: false,
};
// ─────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
