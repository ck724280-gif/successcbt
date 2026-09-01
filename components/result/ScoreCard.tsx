"use client";

import React from "react";
import {
  Trophy,
  Target,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Users,
} from "lucide-react";
import { formatTime, formatScore } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";

export interface ScoreCardProps {
  summary: {
    score: number;
    positiveScore: number;
    negativeScore: number;
    totalMarks: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    totalQuestions: number;
    accuracy: number;
    percentage: number;
    timeSpentSeconds: number;
    rank: number;
    percentile: number;
    totalCandidates: number;
    isPassed: boolean;
  };
  testTitle: string;
  candidateName: string;
}

export function ScoreCard({ summary, testTitle, candidateName }: ScoreCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant={summary.isPassed ? "success" : "danger"}
              className="text-xs px-3 py-1 font-bold"
            >
              {summary.isPassed ? "TEST QUALIFIED (PASSED)" : "NEEDS IMPROVEMENT"}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {testTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Candidate: <span className="font-bold text-slate-700">{candidateName}</span>
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex flex-col items-start sm:items-end bg-blue-50/80 border border-blue-200 rounded-2xl px-6 py-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Your Final Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black text-blue-900">
              {formatScore(summary.score)}
            </span>
            <span className="text-sm font-bold text-blue-600">
              / {formatScore(summary.totalMarks)}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rank */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900/70 uppercase">Rank</p>
            <p className="text-lg sm:text-xl font-black text-amber-950">
              #{summary.rank}{" "}
              <span className="text-xs font-semibold text-amber-700">
                of {summary.totalCandidates}
              </span>
            </p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900/70 uppercase">Accuracy</p>
            <p className="text-lg sm:text-xl font-black text-emerald-950">
              {summary.accuracy}%
            </p>
          </div>
        </div>

        {/* Percentile */}
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-900/70 uppercase">Percentile</p>
            <p className="text-lg sm:text-xl font-black text-purple-950">
              {summary.percentile}%
            </p>
          </div>
        </div>

        {/* Time Taken */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-md">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Time Spent</p>
            <p className="text-lg sm:text-xl font-black text-slate-800 font-mono">
              {formatTime(summary.timeSpentSeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Question Response Breakdown Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
          <span>Question Performance Overview</span>
          <span>{summary.totalQuestions} Questions Total</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Correct */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-emerald-800">Correct</p>
                <p className="text-lg font-black text-emerald-950">{summary.correctCount}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-md">
              +{formatScore(summary.positiveScore)}
            </span>
          </div>

          {/* Incorrect */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs font-semibold text-red-800">Incorrect</p>
                <p className="text-lg font-black text-red-950">{summary.incorrectCount}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-100/80 px-2 py-1 rounded-md">
              -{formatScore(summary.negativeScore)}
            </span>
          </div>

          {/* Unattempted */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold text-slate-600">Unattempted</p>
                <p className="text-lg font-black text-slate-800">{summary.unattemptedCount}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded-md">
              0.00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
