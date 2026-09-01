"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ScoreCard } from "@/components/result/ScoreCard";
import { SectionBreakdownTable } from "@/components/result/SectionBreakdownTable";
import { QuestionSolutionReview } from "@/components/result/QuestionSolutionReview";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, RotateCcw, History, LayoutDashboard, Share2, Printer } from "lucide-react";

export default function ResultPage() {
  const params = useParams();
  const attemptId = params?.attemptId as string;
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/results/${attemptId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load result analysis.");
        }

        setResultData(data.data);
      } catch (err: any) {
        console.error("Fetch Result Error:", err);
        setError(err.message || "Error loading test result.");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId && authStatus === "authenticated") {
      fetchResult();
    } else if (authStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=/result/${attemptId}`);
    }
  }, [attemptId, authStatus, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-base font-bold text-slate-700">Calculating your performance metrics & scorecard...</p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Result Not Available</h3>
        <p className="text-sm text-slate-600">{error || "Could not find result for this test attempt."}</p>
        <Link href="/dashboard">
          <Button variant="primary" className="mt-2">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/history">
            <Button variant="outline" size="sm" className="font-semibold gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              All Attempts
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Performance Analysis & Result
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="font-semibold gap-1.5 hidden sm:flex"
          >
            <Printer className="w-4 h-4" />
            Print Scorecard
          </Button>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="font-bold gap-1.5 shadow-sm">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Scorecard Hero */}
      <ScoreCard
        summary={resultData.summary}
        testTitle={resultData.test.title}
        candidateName={resultData.candidate.name}
      />

      {/* 2. Sectional Breakdown Table */}
      {resultData.sectionBreakdowns && resultData.sectionBreakdowns.length > 0 && (
        <SectionBreakdownTable sections={resultData.sectionBreakdowns} />
      )}

      {/* 3. Question-by-Question Solution & Explanations */}
      <QuestionSolutionReview questions={resultData.questions} />
    </div>
  );
}
