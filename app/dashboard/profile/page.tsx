"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Shield, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { toast } = useToast();

  const [name, setName] = useState(session?.user?.name || "");

  if (authStatus === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {session?.user?.name || "Candidate Profile"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{session?.user?.email}</p>
            <Badge variant="default" className="mt-2 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Role: {session?.user?.role}
            </Badge>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4 max-w-lg">
          <h2 className="text-base font-bold text-slate-900">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-400 uppercase">Email</span>
              <span className="font-semibold text-slate-800">{session?.user?.email}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="block text-xs font-bold text-slate-400 uppercase">Account Status</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4" /> Active & Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
