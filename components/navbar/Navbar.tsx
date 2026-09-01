"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ChevronDown,
  Globe,
  Bell,
  CheckCircle2,
  Ticket,
  User,
  LogOut,
  LayoutDashboard,
  History,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [goal, setGoal] = useState("SSC Exams");

  // If in CBT exam mode, do not render top bar
  if (pathname?.startsWith("/test/")) {
    return null;
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 select-none shadow-xs">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left Goal / Supercoaching */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <span className="font-extrabold text-sm text-pink-600 tracking-tight flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-black">
                S
              </span>
              Supercoaching
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50">
              <span>{goal}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Center Search Bar (Testbook Style) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search for your Exam, Test Series or Topic..."
              className="w-full pl-10 pr-4 py-1.5 text-xs sm:text-sm rounded-full border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Language Toggle with icon */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer hover:bg-slate-100">
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-1 rounded">
              अ/E
            </span>
            <span>All Languages</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {/* Pass Active Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pass Active</span>
          </div>

          {/* Notifications Bell */}
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full">
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile / Auth */}
          {status === "authenticated" && session?.user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#00baf2] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden md:inline text-xs font-bold text-slate-800">
                  {session.user.name?.split(" ")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold">Account</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{session.user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                    My Dashboard
                  </Link>

                  <Link
                    href="/dashboard/history"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Attempted Tests & Analysis
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50/50 hover:bg-amber-100/50"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Admin Control Panel
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs font-bold text-slate-700">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs font-bold bg-[#00baf2] hover:bg-[#00a3d4] text-white">
                  Join Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
