"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/utils/cn";

export default function AttemptHistoryPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/dashboard");
        const data = await res.json();
        if (data.success) {
          setAttempts(data.data.recentAttempts || []);
        }
      } catch (err) {
        console.error("History load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      loadHistory();
    } else if (authStatus === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard/history");
    }
  }, [authStatus, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading attempt history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Complete Test Attempt History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your past submissions, accuracy scores, and step-by-step solution keys
            </p>
          </div>
          <Badge variant="secondary" className="text-xs font-bold px-3 py-1">
            {attempts.length} Total Attempts
          </Badge>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {attempts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-700">No test attempts on record yet.</p>
            <Link href="/exams">
              <Button variant="primary" size="sm">Browse Mock Tests</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Test Name</th>
                  <th className="pb-3 px-2 text-center">Attempt Date</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                  <th className="pb-3 px-2 text-center">Score</th>
                  <th className="pb-3 px-2 text-center">Accuracy</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attempts.map((att) => (
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
                        hour: "2-digit",
                        minute: "2-digit",
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
                            Scorecard & Solutions →
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/test/${att.id}`}>
                          <Button variant="warning" size="sm" className="text-xs font-bold">
                            Resume Test
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
