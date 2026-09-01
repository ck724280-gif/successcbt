"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Shield, Zap, Award, BookOpen, Clock } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer in full-screen CBT exam
  if (pathname?.startsWith("/test/")) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                PARIKSHA<span className="text-blue-400">CBT</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier high-performance Computer Based Test (CBT) platform. Practice SSC, Banking, Railways, and State exams in real exam simulated environments with Hindi & English bilingual support.
            </p>
          </div>

          {/* Col 2: Major Exams */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Popular Exams</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/exams/ssc-cgl-tier-1" className="hover:text-white transition-colors">
                  SSC CGL Mock Tests
                </Link>
              </li>
              <li>
                <Link href="/exams/ibps-po-prelims" className="hover:text-white transition-colors">
                  IBPS PO Practice Sets
                </Link>
              </li>
              <li>
                <Link href="/exams/rrb-ntpc-cbt-1" className="hover:text-white transition-colors">
                  RRB NTPC CBT-1 Tests
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-blue-400 transition-colors font-medium">
                  View All Exams →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform Highlights</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Anti-Loss Auto Save Engine
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Server-Synchronized Timer
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                NTA Pattern Question Palette
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Deep Performance Analytics
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" className="hover:text-white transition-colors">
                  Attempt History
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login / Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register Free
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ParikshaCBT. Built for speed, scale, and high-concurrency examination.</p>
          <div className="flex items-center gap-4">
            <span>English / हिन्दी Compatible</span>
            <span>•</span>
            <span>Vercel + PostgreSQL Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
