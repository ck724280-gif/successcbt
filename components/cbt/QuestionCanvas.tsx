"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface QuestionCanvasProps {
  questionIndex: number;
  totalQuestions: number;
  question: {
    questionId: string;
    sectionId?: string | null;
    subjectName?: string | null;
    marks: number;
    negativeMarks: number;
    questionEn: string;
    questionHi?: string | null;
    explanationEn?: string | null;
    explanationHi?: string | null;
    options: Array<{
      id: string;
      optionKey: string;
      contentEn: string;
      contentHi?: string | null;
    }>;
  };
  selectedOptionKey: string | null;
  markedForReview: boolean;
  selectedLanguage: "en" | "hi";
  onSelectOption: (optionKey: string) => void;
  onClearResponse: () => void;
  onMarkForReviewAndNext: () => void;
  onSaveAndNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  // Optional Solution Mode props
  isSolutionMode?: boolean;
  correctOptionKey?: string;
}

export function QuestionCanvas({
  questionIndex,
  totalQuestions,
  question,
  selectedOptionKey,
  markedForReview,
  selectedLanguage,
  onSelectOption,
  onClearResponse,
  onMarkForReviewAndNext,
  onSaveAndNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
  isSolutionMode = false,
  correctOptionKey,
}: QuestionCanvasProps) {
  const [showSolution, setShowSolution] = useState(isSolutionMode);
  const [reAttemptMode, setReAttemptMode] = useState(false);

  const isHindi = selectedLanguage === "hi" && Boolean(question.questionHi);
  const questionText = isHindi ? question.questionHi! : question.questionEn;
  const explanationText = isHindi && question.explanationHi ? question.explanationHi : question.explanationEn;

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-none sm:rounded-xl shadow-xs overflow-hidden min-h-[620px]">
      {/* 1. Question Meta Bar (Screenshot 4 & 5) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Question No & Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-sm text-slate-900">
            Question No.{questionIndex + 1}
          </span>

          {/* Testbook Green 'सही' / 'Correct' Badge */}
          <span className="bg-[#22c55e] text-white font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
            सही
          </span>

          {/* Time spent: आप: 00:29  औसत: 00:26 */}
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-red-500" />
            <span>आप: 00:29</span>
            <span className="text-slate-300">•</span>
            <span>औसत: 00:26</span>
          </div>

          {/* Marks circle badge: अंक +2 */}
          <div className="flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            <span className="text-slate-500">अंक</span>
            <span className="w-4 h-4 rounded-full bg-[#22c55e] text-white font-bold flex items-center justify-center text-[10px]">
              {question.marks}
            </span>
          </div>

          {/* Community Stats Badge: 70% answered correctly */}
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded text-[11px]">
            70% answered correctly
          </span>
        </div>
      </div>

      {/* 2. Main Question Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
        {/* Question Text */}
        <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
          {questionText}
        </div>

        {/* Options List (Testbook style radio + green highlight for correct) */}
        <div className="space-y-3 pt-2">
          {question.options.map((opt) => {
            const isSelected = selectedOptionKey === opt.optionKey;
            const isCorrectAnswer = opt.optionKey === correctOptionKey;
            const optContent = isHindi && opt.contentHi ? opt.contentHi : opt.contentEn;

            // If in solution mode or correct answer
            if (isSolutionMode && isCorrectAnswer) {
              return (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 p-3.5 rounded-lg bg-[#22c55e] text-white font-bold text-sm shadow-xs transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{optContent}</span>
                </div>
              );
            }

            return (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt.optionKey)}
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer select-none transition-all ${
                  isSelected
                    ? "border-[#00baf2] bg-[#e5f7fd] text-slate-900 font-semibold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? "border-[#00baf2] bg-[#00baf2]"
                      : "border-slate-400 bg-white"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm">{optContent}</span>
              </div>
            );
          })}
        </div>

        {/* Re-attempt Mode ON Box (Screenshot 4) */}
        {reAttemptMode && (
          <div className="p-4 rounded-lg bg-[#fff8e7] border border-[#ffe082] text-xs text-slate-800 space-y-1">
            <p className="font-bold text-[#b78103]">Re-attempt mode: ON</p>
            <p className="text-slate-600">Now You can re-attempt the question</p>
          </div>
        )}

        {/* View Solution Button Trigger (if not in solution mode) */}
        {!showSolution && (
          <div className="pt-2">
            <button
              onClick={() => setShowSolution(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#00baf2] text-[#00baf2] hover:bg-[#e5f7fd] text-xs font-bold transition-colors"
            >
              👁 View Solution
              <span className="text-[11px] text-slate-400 font-normal ml-2">Click here to see the answer now</span>
            </button>
          </div>
        )}

        {/* Detailed Solution Box (Screenshot 5 exact Testbook style) */}
        {showSolution && explanationText && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Solution
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 font-sans">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Shortcut Trick</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {explanationText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Testbook Action Bar (Screenshot 4 & 5) */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="font-bold text-slate-700 rounded-lg px-4 border-slate-300"
        >
          Previous
        </Button>

        {/* Center: Re-attempt toggle switch (Screenshot 4 & 5) */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Re-attempt Questions</span>
          <button
            type="button"
            onClick={() => setReAttemptMode(!reAttemptMode)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              reAttemptMode ? "bg-[#00baf2]" : "bg-slate-300"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                reAttemptMode ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Right: Next / Save and Next */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onSaveAndNext}
            className="bg-[#00baf2] hover:bg-[#00a3d4] text-white font-bold px-6 rounded-lg shadow-xs"
          >
            {isLastQuestion ? "Finish Test" : "अगला / Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
