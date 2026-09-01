"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck2,
  FileQuestion,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  Target,
  Award,
  Plus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/utils/cn";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (e) {
        console.error("Admin stats error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading admin analytics & metrics...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalUsers: 0,
    totalTests: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    activeTestsCount: 0,
    submittedCount: 0,
    avgScore: 0,
    avgAccuracy: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Administrator Analytics & Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time examination statistics, user activity, and mock test overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/questions/import">
            <Button variant="outline" size="sm" className="font-bold gap-1.5 bg-white">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Import Questions
            </Button>
          </Link>
          <Link href="/admin/tests/new">
            <Button variant="primary" size="sm" className="font-bold gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              Create Test
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</p>
            <p className="text-2xl font-black text-slate-900">{metrics.totalUsers}</p>
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tests</p>
            <p className="text-2xl font-black text-slate-900">{metrics.activeTestsCount} <span className="text-xs font-normal text-slate-400">/ {metrics.totalTests}</span></p>
          </div>
        </div>

        {/* Total Questions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Bank</p>
            <p className="text-2xl font-black text-slate-900">{metrics.totalQuestions}</p>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submissions</p>
            <p className="text-2xl font-black text-slate-900">{metrics.submittedCount}</p>
          </div>
        </div>
      </div>

      {/* Grid: Recent Attempts & Popular Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Attempts Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Recent Candidate Submissions
            </h2>
            <Badge variant="secondary" className="text-xs font-bold">
              Latest 8
            </Badge>
          </div>

          {!stats?.recentAttempts || stats.recentAttempts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No candidate attempts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-2">Candidate</th>
                    <th className="pb-3 px-2">Test Name</th>
                    <th className="pb-3 px-2 text-center">Score</th>
                    <th className="pb-3 px-2 text-center">Accuracy</th>
                    <th className="pb-3 px-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats.recentAttempts.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-800">{att.userName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{att.userEmail}</p>
                      </td>
                      <td className="py-3 px-2 text-slate-700 font-semibold truncate max-w-[160px]">
                        {att.testTitle}
                      </td>
                      <td className="py-3 px-2 text-center font-black text-slate-900">
                        {formatScore(att.score)} <span className="text-[10px] text-slate-400">/{att.totalMarks}</span>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-emerald-600">
                        {att.accuracy}%
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link href={`/result/${att.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2 font-bold text-blue-600">
                            Scorecard
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular Tests Widget (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Most Attempted Tests
            </h2>
            <Link href="/admin/tests" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Manage →
            </Link>
          </div>

          {!stats?.popularTests || stats.popularTests.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No tests available.</p>
          ) : (
            <div className="space-y-3">
              {stats.popularTests.map((t: any) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 truncate max-w-[180px]">
                      {t.examTitle}
                    </span>
                    <Badge variant={t.isPublished ? "success" : "secondary"} className="text-[10px]">
                      {t.isPublished ? "Active" : "Draft"}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                    {t.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1 border-t border-slate-200/50">
                    <span>{t.totalQuestions} Questions</span>
                    <span className="font-bold text-blue-600">{t.attemptsCount} Attempts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
