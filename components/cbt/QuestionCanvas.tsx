"use client";

import React from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Bookmark, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
}: QuestionCanvasProps) {
  // Determine question and options display text based on language preference
  const showHindi = selectedLanguage === "hi" && Boolean(question.questionHi);
  const questionText = showHindi ? question.questionHi! : question.questionEn;

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[580px]">
      {/* Top Question Metadata Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
            Question {questionIndex + 1} <span className="text-slate-400 font-normal text-xs">of {totalQuestions}</span>
          </span>
          {question.subjectName && (
            <Badge variant="secondary" className="font-semibold text-slate-700">
              {question.subjectName}
            </Badge>
          )}
          {markedForReview && (
            <Badge variant="purple" className="flex items-center gap-1 font-bold">
              <Bookmark className="w-3 h-3 fill-purple-600" />
              Marked for Review
            </Badge>
          )}
        </div>

        {/* Marks Scheme Info */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            +{question.marks} Correct
          </span>
          {question.negativeMarks > 0 && (
            <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
              -{question.negativeMarks} Wrong
            </span>
          )}
        </div>
      </div>

      {/* Main Question Body Canvas */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
        {/* Question Text */}
        <div className="text-base md:text-lg font-medium text-slate-900 leading-relaxed space-y-3">
          <p className="whitespace-pre-wrap">{questionText}</p>
          
          {/* If language is Hindi and English is also available, or vice versa, show secondary language optionally */}
          {selectedLanguage === "hi" && question.questionEn && question.questionEn !== question.questionHi && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-sm text-slate-500 italic">
              <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider not-italic block mb-1">
                English Reference:
              </span>
              {question.questionEn}
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select one option:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt) => {
              const isSelected = selectedOptionKey === opt.optionKey;
              const optContent =
                selectedLanguage === "hi" && opt.contentHi ? opt.contentHi : opt.contentEn;

              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectOption(opt.optionKey)}
                  className={`group relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 shadow-sm"
                      : "border-slate-200 bg-slate-50/40 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  {/* Option Letter Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                        : "bg-white border-2 border-slate-300 text-slate-700 group-hover:border-blue-400 group-hover:text-blue-600"
                    }`}
                  >
                    {opt.optionKey}
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 pt-1 text-sm md:text-base font-medium text-slate-800 leading-normal">
                    {optContent}
                  </div>

                  {/* Selected Radio Indicator */}
                  {isSelected && (
                    <div className="pt-1 text-blue-600 animate-in zoom-in duration-100">
                      <CheckCircle className="w-5 h-5 fill-blue-600 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CBT Action Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions: Previous & Clear */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            className="font-semibold text-slate-700 border-slate-300 hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={onClearResponse}
            disabled={!selectedOptionKey}
            className="font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear Response
          </Button>
        </div>

        {/* Right Actions: Mark for Review & Save & Next */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="review"
            size="md"
            onClick={onMarkForReviewAndNext}
            className="font-bold text-xs sm:text-sm shadow-sm"
          >
            <Bookmark className="w-4 h-4 mr-1.5" />
            Mark for Review & Next
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onSaveAndNext}
            className="font-bold text-xs sm:text-sm px-5 shadow-sm shadow-blue-500/20"
          >
            {isLastQuestion ? "Save & View Summary" : "Save & Next"}
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
