"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  History,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // If on the CBT exam test taking screen, do not show standard header to preserve full exam immersion
  if (pathname?.startsWith("/test/")) {
    return null;
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-slate-900 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="tracking-tight text-lg leading-none font-extrabold text-blue-700">
                PARIKSHA<span className="text-slate-900">CBT</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Online Test Series
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/exams"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/exams" || pathname?.startsWith("/exams/")
                  ? "text-blue-600 font-semibold"
                  : "text-slate-600"
              }`}
            >
              Exams & Categories
            </Link>
            <Link
              href="/dashboard"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/dashboard"
                  ? "text-blue-600 font-semibold"
                  : "text-slate-600"
              }`}
            >
              My Dashboard
            </Link>
            <Link
              href="/dashboard/history"
              className={`transition-colors hover:text-blue-600 ${
                pathname === "/dashboard/history"
                  ? "text-blue-600 font-semibold"
                  : "text-slate-600"
              }`}
            >
              Attempt History
            </Link>
          </nav>
        </div>

        {/* Right Section / User actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-amber-300 bg-amber-50/50 text-amber-900 hover:bg-amber-100 font-semibold gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Admin Panel
              </Button>
            </Link>
          )}

          {status === "authenticated" && session?.user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-800 pr-2">
                  {session.user.name?.split(" ")[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{session.user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {session.user.role}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/history"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <History className="w-4 h-4 text-slate-500" />
                    Test History & Analysis
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    Profile Settings
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="font-semibold shadow-sm">
                  Register Free
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/exams"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            Exams & Mock Tests
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            My Dashboard
          </Link>
          <Link
            href="/dashboard/history"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            Attempt History
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-amber-700"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {status === "authenticated" ? (
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 justify-center"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
