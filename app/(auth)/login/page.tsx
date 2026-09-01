"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, Mail, ArrowRight, ShieldAlert, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { toast, error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        toastError(res.error || "Invalid credentials. Please try again.");
      } else {
        toast("Login successful! Redirecting...", "success");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toastError("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Sign In to ParikshaCBT
        </h2>
        <p className="text-xs text-slate-500">
          Access your tests, bookmarks, and detailed scorecard analytics
        </p>
      </div>

      {/* Quick Demo Credentials Box */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
          ⚡ Quick Demo Accounts (1-Click Fill):
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemo("user@cbt.com", "User@12345")}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Candidate Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin@cbt.com", "Admin@12345")}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-300 hover:bg-amber-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Admin Demo
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@cbt.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full font-bold shadow-md shadow-blue-500/20 mt-2"
        >
          Sign In Now
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don't have an account yet?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
          Register Free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
