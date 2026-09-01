"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Info,
  Lightbulb,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/utils/cn";

export interface QuestionSolutionItem {
  questionIndex: number;
  questionId: string;
  sectionTitle?: string | null;
  subjectName?: string | null;
  difficulty: string;
  questionEn: string;
  questionHi?: string | null;
  explanationEn?: string | null;
  explanationHi?: string | null;
  marks: number;
  negativeMarks: number;
  marksAwarded: number;
  timeSpentSeconds: number;
  selectedOptionKey: string | null;
  correctOptionKey: string;
  isAttempted: boolean;
  isCorrect: boolean;
  status: "CORRECT" | "INCORRECT" | "UNATTEMPTED";
  markedForReview: boolean;
  options: Array<{
    id: string;
    optionKey: string;
    contentEn: string;
    contentHi?: string | null;
    isCorrect: boolean;
  }>;
}

export function QuestionSolutionReview({
  questions,
}: {
  questions: QuestionSolutionItem[];
}) {
  const [filter, setFilter] = useState<"ALL" | "CORRECT" | "INCORRECT" | "UNATTEMPTED" | "MARKED">("ALL");
  const [lang, setLang] = useState<"en" | "hi">("en");

  const countCorrect = questions.filter((q) => q.status === "CORRECT").length;
  const countIncorrect = questions.filter((q) => q.status === "INCORRECT").length;
  const countUnattempted = questions.filter((q) => q.status === "UNATTEMPTED").length;
  const countMarked = questions.filter((q) => q.markedForReview).length;

  const filteredQuestions = questions.filter((q) => {
    if (filter === "CORRECT") return q.status === "CORRECT";
    if (filter === "INCORRECT") return q.status === "INCORRECT";
    if (filter === "UNATTEMPTED") return q.status === "UNATTEMPTED";
    if (filter === "MARKED") return q.markedForReview;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Question-by-Question Solution & Detailed Explanations
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review your answers with step-by-step verified explanations in English and हिन्दी
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center self-start md:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              lang === "en" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang("hi")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              lang === "hi" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            filter === "ALL"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All Questions ({questions.length})
        </button>
        <button
          onClick={() => setFilter("CORRECT")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filter === "CORRECT"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Correct ({countCorrect})
        </button>
        <button
          onClick={() => setFilter("INCORRECT")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filter === "INCORRECT"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-red-50 text-red-800 hover:bg-red-100 border border-red-200"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Incorrect ({countIncorrect})
        </button>
        <button
          onClick={() => setFilter("UNATTEMPTED")}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filter === "UNATTEMPTED"
              ? "bg-slate-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Unattempted ({countUnattempted})
        </button>
        {countMarked > 0 && (
          <button
            onClick={() => setFilter("MARKED")}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === "MARKED"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Marked for Review ({countMarked})
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6 pt-2">
        {filteredQuestions.map((q) => {
          const isHindi = lang === "hi" && Boolean(q.questionHi);
          const qText = isHindi ? q.questionHi! : q.questionEn;
          const explanationText = isHindi && q.explanationHi ? q.explanationHi : q.explanationEn;

          return (
            <div
              key={q.questionId}
              className={`rounded-2xl border p-6 space-y-5 transition-all ${
                q.status === "CORRECT"
                  ? "border-emerald-200 bg-emerald-50/10"
                  : q.status === "INCORRECT"
                  ? "border-red-200 bg-red-50/10"
                  : "border-slate-200 bg-slate-50/30"
              }`}
            >
              {/* Question Header Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {q.questionIndex + 1}
                  </span>
                  {q.subjectName && (
                    <Badge variant="secondary" className="font-semibold">
                      {q.subjectName}
                    </Badge>
                  )}
                  {q.markedForReview && (
                    <Badge variant="purple" className="flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> Marked Review
                    </Badge>
                  )}
                </div>

                {/* Status and Marks Awarded */}
                <div className="flex items-center gap-2 text-xs font-bold">
                  {q.status === "CORRECT" && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks})
                    </span>
                  )}
                  {q.status === "INCORRECT" && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect (-{q.negativeMarks})
                    </span>
                  )}
                  {q.status === "UNATTEMPTED" && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                      <HelpCircle className="w-3.5 h-3.5" /> Unattempted (0.00)
                    </span>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <div className="text-base font-semibold text-slate-900 leading-relaxed">
                {qText}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {q.options.map((opt) => {
                  const isOfficialCorrect = opt.optionKey === q.correctOptionKey;
                  const isUserSelected = opt.optionKey === q.selectedOptionKey;
                  const optContent =
                    isHindi && opt.contentHi ? opt.contentHi : opt.contentEn;

                  let optCardStyle = "border-slate-200 bg-white text-slate-700";
                  let badge = null;

                  if (isOfficialCorrect) {
                    optCardStyle = "border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs";
                    badge = (
                      <span className="ml-auto text-[11px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Correct Answer
                      </span>
                    );
                  } else if (isUserSelected && !isOfficialCorrect) {
                    optCardStyle = "border-2 border-red-400 bg-red-50 text-red-950 font-semibold shadow-xs";
                    badge = (
                      <span className="ml-auto text-[11px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <X className="w-3 h-3 stroke-[3]" /> Your Choice
                      </span>
                    );
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${optCardStyle}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isOfficialCorrect
                            ? "bg-emerald-600 text-white"
                            : isUserSelected
                            ? "bg-red-500 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="text-sm flex-1">{optContent}</span>
                      {badge}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation Box */}
              {explanationText && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-800 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                    Verified Detailed Solution & Concept:
                  </div>
                  <p className="text-sm font-normal text-slate-800 leading-relaxed whitespace-pre-wrap pl-6">
                    {explanationText}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
