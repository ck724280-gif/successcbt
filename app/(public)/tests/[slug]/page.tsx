"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function TestInstructionsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { toast, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    async function loadTestInfo() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tests/${slug}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load test instructions.");
        }
        setTest(data.data);
      } catch (err: any) {
        console.error("Test load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadTestInfo();
    }
  }, [slug]);

  const handleStartTest = async () => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/tests/${slug}`);
      return;
    }

    if (!agreeTerms) {
      toastError("Please read and accept the examination instructions to proceed.");
      return;
    }

    try {
      setIsStarting(true);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to initiate test attempt.");
      }

      toast(data.message || "Entering examination environment...", "success");
      router.push(`/test/${data.data.attemptId}`);
    } catch (err: any) {
      console.error("Start test error:", err);
      toastError(err.message || "Could not start test. Please try again.");
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading examination instructions...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Test Not Found</h2>
        <p className="text-sm text-slate-500">The requested test may be inactive or unavailable.</p>
        <Link href="/exams">
          <Button variant="primary">Browse Available Exams</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation */}
      <Link
        href={test.exam ? `/exams/${test.exam.slug}` : "/exams"}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {test.exam?.title || "Exams"}
      </Link>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <Badge variant="default" className="font-bold text-xs">
              {test.exam?.title}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {test.title}
            </h1>
          </div>

          {/* Language Preference */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedLanguage("en")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedLanguage === "en" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage("hi")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedLanguage === "hi" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <FileQuestion className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Questions</span>
            </div>
            <p className="text-xl font-black text-blue-950">{test._count.testQuestions} Qs</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Duration</span>
            </div>
            <p className="text-xl font-black text-amber-950">{test.durationMinutes} Minutes</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Max Marks</span>
            </div>
            <p className="text-xl font-black text-emerald-950">{test.totalMarks}</p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Negative Marking</span>
            </div>
            <p className="text-xl font-black text-red-950">
              {test.isNegativeMarking ? `-${test.negativeMarksPerQ} Marks` : "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Sections Breakdown (if multiple sections exist) */}
      {test.sections && test.sections.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">
            Test Sections & Marking Scheme
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {test.sections.map((sec: any) => (
              <div key={sec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">{sec.title}</h4>
                  <span className="text-xs font-bold text-slate-500">
                    {sec._count?.testQuestions || sec.totalQuestions} Questions
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-700">+{sec.positiveMarks} Correct</span>
                  <span className="text-red-700">-{sec.negativeMarks} Incorrect</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examination Guidelines */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-black text-slate-900">
            Standard CBT Examination Guidelines
          </h3>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-normal">
          <p className="font-semibold text-slate-900">
            Please read the following instructions carefully before starting the test:
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-1">
            <li>
              The clock in the top right corner displays the remaining time. When the timer reaches <strong className="text-red-600">00:00</strong>, the test will automatically submit.
            </li>
            <li>
              Use the <strong className="text-blue-700">Question Palette</strong> on the right side of your screen to navigate directly to any question.
            </li>
            <li>
              <span className="font-bold text-emerald-700">Green</span>: Answered • <span className="font-bold text-red-600">Red</span>: Not Answered • <span className="font-bold text-purple-700">Purple</span>: Marked for Review • <span className="font-bold text-slate-600">Gray</span>: Not Visited.
            </li>
            <li>
              Click <strong className="text-slate-900">Save & Next</strong> to save your selected answer and proceed to the next question.
            </li>
            <li>
              Your responses are <strong className="text-blue-700">auto-saved on our cloud servers</strong>. If your browser accidentally refreshes, your progress will be restored seamlessly upon resumption.
            </li>
          </ol>
        </div>

        {/* Confirmation Checkbox */}
        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-900 leading-normal select-none">
              I have read and understood all the instructions above. I declare that I will adhere to examination guidelines and submit my responses truthfully.
            </span>
          </label>
        </div>

        {/* Start Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {authStatus === "unauthenticated" ? "You will be prompted to login before starting." : `Logged in as ${session?.user?.name}`}
          </p>

          <Button
            size="lg"
            variant="primary"
            onClick={handleStartTest}
            isLoading={isStarting}
            disabled={!agreeTerms}
            className="w-full sm:w-auto font-black text-base px-8 py-3 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 gap-2"
          >
            <Zap className="w-5 h-5" />
            I am Ready to Begin Test
          </Button>
        </div>
      </div>
    </div>
  );
}
