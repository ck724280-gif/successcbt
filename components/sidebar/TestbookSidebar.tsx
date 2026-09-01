"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Video,
  BookOpen,
  FileSpreadsheet,
  MonitorPlay,
  FileText,
  Bookmark,
  Target,
  HelpCircle,
  CheckCircle2,
  Ticket,
  Trophy,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { useSession } from "next-auth/react";

export function TestbookSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // If inside active CBT test taking engine, do not render sidebar
  if (pathname?.startsWith("/test/")) {
    return null;
  }

  const isAdmin = session?.user?.role === "ADMIN";

  const isLinkActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname?.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-56 lg:w-60 bg-[#1f242e] text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-[#2d3442] select-none text-xs font-medium sticky top-0 h-screen overflow-y-auto scrollbar-thin z-30">
      {/* Testbook Official Brand Logo */}
      <div className="p-4 border-b border-[#2d3442] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Testbook Icon mark */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00baf2] to-[#00e5ff] flex items-center justify-center text-[#1f242e] shadow-sm font-black text-lg">
            tb
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            testbook
          </span>
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="p-3 space-y-5 flex-1">
        {/* Home */}
        <div className="space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isLinkActive("/") && pathname === "/"
                ? "bg-[#282e3b] text-white font-bold"
                : "text-slate-300 hover:bg-[#282e3b] hover:text-white"
            }`}
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span className="text-[13px]">Home</span>
          </Link>
        </div>

        {/* LEARN Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            LEARN
          </p>
          <Link
            href="/exams"
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              pathname?.startsWith("/supercoaching")
                ? "bg-[#282e3b] text-white font-bold"
                : "text-slate-300 hover:bg-[#282e3b] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-pink-500 fill-pink-500/30" />
              <span className="text-[12px]">SuperCoaching</span>
            </div>
          </Link>

          <Link
            href="/exams"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-slate-400" />
              <span className="text-[12px]">Live Classes</span>
            </div>
            <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.2 rounded uppercase">
              FREE
            </span>
          </Link>

          <Link
            href="/exams"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-[12px]">Books</span>
          </Link>
        </div>

        {/* TESTS Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            TESTS
          </p>
          <Link
            href="/exams"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
              pathname === "/exams" || pathname?.startsWith("/exams/")
                ? "bg-[#00baf2]/20 text-[#00baf2] font-bold border-l-4 border-[#00baf2]"
                : "text-slate-300 hover:bg-[#282e3b] hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00baf2]" />
            <span className="text-[12px]">Test Series</span>
          </Link>

          <Link
            href="/exams"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <MonitorPlay className="w-4 h-4 text-slate-400" />
            <span className="text-[12px]">Live Tests & Quizzes</span>
          </Link>

          <Link
            href="/exams"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-[12px]">Previous Year Papers</span>
          </Link>

          <Link
            href="/exams"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-slate-400" />
              <span className="text-[12px]">Study Notes</span>
            </div>
            <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.2 rounded uppercase">
              NEW
            </span>
          </Link>

          <Link
            href="/exams"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <Target className="w-4 h-4 text-slate-400" />
            <span className="text-[12px]">Practice</span>
          </Link>

          <Link
            href="/exams"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="text-[12px]">Free Quizzes</span>
            </div>
            <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.2 rounded uppercase">
              NEW
            </span>
          </Link>

          <Link
            href="/dashboard/history"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/dashboard/history"
                ? "bg-[#282e3b] text-white font-bold"
                : "text-slate-300 hover:bg-[#282e3b] hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px]">Attempted Tests</span>
          </Link>

          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300">
            <div className="flex items-center gap-2.5">
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="text-[12px]">Pass</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400">
              384 Days Left
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-[12px]">Rank Predictor</span>
            </div>
            <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.2 rounded uppercase">
              NEW
            </span>
          </div>
        </div>

        {/* MISCELLANEOUS */}
        <div className="space-y-1 pt-2 border-t border-[#2d3442]">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MISCELLANEOUS
          </p>
          <Link
            href="/exams"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#282e3b] hover:text-white transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span className="text-[12px]">Exams</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 font-bold hover:bg-amber-500/20 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-[12px]">Admin Portal</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
