"use client";

import React from "react";
import { User, Filter, Smile, Clock, Meh, Frown, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type QuestionStatusType =
  | "ANSWERED"
  | "NOT_ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED"
  | "NOT_VISITED";

export interface QuestionPaletteItem {
  index: number;
  questionId: string;
  status: QuestionStatusType;
  sectionId?: string | null;
}

export interface QuestionPaletteProps {
  candidateName: string;
  items: QuestionPaletteItem[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onOpenQuestionPaper?: () => void;
  onSubmitClick?: () => void;
}

export function QuestionPalette({
  candidateName,
  items,
  currentQuestionIndex,
  onSelectQuestion,
  onOpenQuestionPaper,
  onSubmitClick,
}: QuestionPaletteProps) {
  let countAnswered = 0;
  let countNotAnswered = 0;
  let countMarked = 0;
  let countNotVisited = 0;

  for (const item of items) {
    if (item.status === "ANSWERED" || item.status === "ANSWERED_AND_MARKED") countAnswered++;
    else if (item.status === "NOT_ANSWERED") countNotAnswered++;
    else if (item.status === "MARKED_FOR_REVIEW") countMarked++;
    else countNotVisited++;
  }

  return (
    <div className="w-full lg:w-80 flex flex-col bg-white border border-slate-200 rounded-none sm:rounded-xl shadow-xs overflow-hidden select-none text-xs">
      {/* 1. Candidate Info Bar (Screenshot 4 & 5) */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {candidateName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-slate-800 text-xs truncate max-w-[120px]">
            {candidateName}
          </span>
        </div>

        <button className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-[11px] font-semibold">
          <Filter className="w-3 h-3" />
          <span>Filter</span>
        </button>
      </div>

      {/* 2. Status Counter Pills (Screenshot 4 & 5 exact counters) */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/60 grid grid-cols-2 gap-2 text-[11px] font-semibold">
        <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-2 py-1 rounded">
          <span className="font-black">{countAnswered}</span>
          <span>Correct / Ans</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-200 text-slate-800 px-2 py-1 rounded">
          <span className="font-black">{countNotVisited}</span>
          <span>Unattempted</span>
        </div>
        <div className="flex items-center gap-1.5 bg-red-100 text-red-900 px-2 py-1 rounded">
          <span className="font-black">{countNotAnswered}</span>
          <span>Incorrect</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2 py-1 rounded">
          <span className="font-black">{countMarked}</span>
          <span>Review</span>
        </div>
      </div>

      {/* 3. Speed Indicators (Screenshot 4 & 5) */}
      <div className="p-3 border-b border-slate-200 bg-white space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          SPEED INDICATORS
        </span>
        <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-slate-500 font-medium">
          <div className="flex flex-col items-center">
            <Smile className="w-4 h-4 text-emerald-500 mb-0.5" />
            <span>Superfast</span>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-blue-500 mb-0.5" />
            <span>On Time</span>
          </div>
          <div className="flex flex-col items-center">
            <Meh className="w-4 h-4 text-amber-500 mb-0.5" />
            <span>Slow</span>
          </div>
          <div className="flex flex-col items-center">
            <Frown className="w-4 h-4 text-red-500 mb-0.5" />
            <span>Not Correct</span>
          </div>
        </div>
      </div>

      {/* 4. Section Header (Screenshot 4 & 5 #d1f2f9) */}
      <div className="bg-[#d1f2f9] text-[#006064] px-3.5 py-1.5 font-black text-xs uppercase tracking-wider border-b border-[#b2ebf2]">
        SECTION : Test
      </div>

      {/* 5. Question Number Grid */}
      <div className="p-3.5 flex-1 overflow-y-auto max-h-[340px]">
        <div className="grid grid-cols-5 gap-2">
          {items.map((item) => {
            const isCurrent = currentQuestionIndex === item.index;
            let bgClass = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";

            if (item.status === "ANSWERED" || item.status === "ANSWERED_AND_MARKED") {
              bgClass = "bg-[#22c55e] text-white border-[#16a34a] hover:bg-[#16a34a]";
            } else if (item.status === "NOT_ANSWERED") {
              bgClass = "bg-red-500 text-white border-red-600 hover:bg-red-600";
            } else if (item.status === "MARKED_FOR_REVIEW") {
              bgClass = "bg-purple-600 text-white border-purple-700 hover:bg-purple-700";
            }

            return (
              <button
                key={item.index}
                onClick={() => onSelectQuestion(item.index)}
                className={`h-9 rounded-md font-bold text-xs border flex items-center justify-center transition-all ${bgClass} ${
                  isCurrent
                    ? "ring-2 ring-[#00baf2] ring-offset-1 scale-105 shadow-sm font-black"
                    : "shadow-xs"
                }`}
              >
                {item.index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Bottom Palette Buttons (Screenshot 4 & 5) */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
        <button
          onClick={onOpenQuestionPaper}
          className="flex-1 py-2 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold text-[11px] text-slate-700 shadow-xs"
        >
          Question Paper
        </button>
        <button
          onClick={onSubmitClick}
          className="flex-1 py-2 px-2 rounded-lg bg-[#00baf2] hover:bg-[#00a3d4] font-bold text-[11px] text-white shadow-xs"
        >
          Summary / Submit
        </button>
      </div>
    </div>
  );
}
