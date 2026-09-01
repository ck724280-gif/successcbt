"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  FileQuestion,
  UploadCloud,
  Users,
  Home,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Manage Tests", href: "/admin/tests", icon: FileCheck2 },
    { label: "Question Bank", href: "/admin/questions", icon: FileQuestion },
    { label: "Bulk Question Import", href: "/admin/questions/import", icon: UploadCloud },
    { label: "User Management", href: "/admin/users", icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
            <CheckCircle2 className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-none">
              PARIKSHA <span className="text-amber-400">ADMIN</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-4 space-y-1.5 text-sm font-semibold">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Student Site</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
