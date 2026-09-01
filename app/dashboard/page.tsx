"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Target,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/utils/cn";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/dashboard");
        const data = await res.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      loadDashboard();
    } else if (authStatus === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [authStatus, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading your candidate dashboard...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalAttempts: 0,
    avgScore: 0,
    avgAccuracy: 0,
    passedCount: 0,
    passRate: 0,
  };

  const recentAttempts = dashboardData?.recentAttempts || [];
  const activeAttempt = recentAttempts.find((a: any) => a.status === "IN_PROGRESS");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-bold text-xs">
            Candidate Dashboard
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome back, {session?.user?.name || "Candidate"}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Track your mock test scores, accuracy trends, and review detailed question solutions to sharpen your exam preparation.
          </p>
        </div>

        <Link href="/exams">
          <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-extrabold shadow-md gap-2">
            Take a New Test
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Active In-Progress Attempt Alert (Anti-Loss Callout) */}
      {activeAttempt && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded uppercase">
                Active Test In Progress
              </span>
              <h3 className="font-black text-slate-900 text-base mt-0.5">
                {activeAttempt.testTitle}
              </h3>
              <p className="text-xs text-slate-600">
                You have an ongoing test. Your answers are safe and ready to resume.
              </p>
            </div>
          </div>

          <Link href={`/test/${activeAttempt.id}`}>
            <Button variant="warning" className="font-bold gap-1.5 shadow-sm">
              Resume Test Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Attempts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tests Taken</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalAttempts}</p>
          </div>
        </div>

        {/* Avg Accuracy */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Accuracy</p>
            <p className="text-2xl font-black text-slate-900">{stats.avgAccuracy}%</p>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
            <p className="text-2xl font-black text-slate-900">{stats.avgScore}</p>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Rate</p>
            <p className="text-2xl font-black text-slate-900">{stats.passRate}%</p>
          </div>
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Recent Test Attempts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Review your scores and question-by-question solutions
            </p>
          </div>

          <Link href="/dashboard/history" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All History →
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-700">You haven't attempted any tests yet.</p>
            <p className="text-xs text-slate-500">Choose an exam to take your first Computer Based Test.</p>
            <Link href="/exams" className="inline-block pt-2">
              <Button variant="primary" size="sm">Explore Available Tests</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Test Name</th>
                  <th className="pb-3 px-2 text-center">Date</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                  <th className="pb-3 px-2 text-center">Score</th>
                  <th className="pb-3 px-2 text-center">Accuracy</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentAttempts.map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-2">
                      <p className="font-bold text-slate-800">{att.testTitle}</p>
                      <p className="text-xs text-slate-400">{att.examTitle}</p>
                    </td>
                    <td className="py-4 px-2 text-center text-xs text-slate-500">
                      {new Date(att.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Badge
                        variant={
                          att.status === "SUBMITTED"
                            ? att.isPassed
                              ? "success"
                              : "secondary"
                            : att.status === "IN_PROGRESS"
                            ? "warning"
                            : "danger"
                        }
                        className="text-xs"
                      >
                        {att.status === "SUBMITTED"
                          ? att.isPassed
                            ? "Passed"
                            : "Submitted"
                          : att.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-slate-900">
                      {att.status === "SUBMITTED" ? (
                        <span>
                          {formatScore(att.score)}{" "}
                          <span className="text-xs text-slate-400">/ {att.totalMarks}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-slate-700">
                      {att.status === "SUBMITTED" ? `${att.accuracy}%` : "—"}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {att.status === "SUBMITTED" ? (
                        <Link href={`/result/${att.id}`}>
                          <Button variant="outline" size="sm" className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
                            View Result
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/test/${att.id}`}>
                          <Button variant="warning" size="sm" className="text-xs font-bold">
                            Resume
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
