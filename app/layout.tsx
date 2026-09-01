import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "ParikshaCBT — Modern Competitive Exam Computer-Based Testing Platform",
  description: "High-performance online CBT examination platform with bilingual Hindi & English support, auto-save state recovery, question palette, real-time timer, and comprehensive performance analytics.",
  keywords: ["CBT exam", "online test series", "SSC CGL mock test", "IBPS PO practice", "RRB NTPC test", "computer based test"],
  authors: [{ name: "ParikshaCBT Engineering" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
