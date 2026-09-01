"use client";

import React from "react";
import { User, Check } from "lucide-react";

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
}

export function QuestionPalette({
  candidateName,
  items,
  currentQuestionIndex,
  onSelectQuestion,
}: QuestionPaletteProps) {
  // Aggregate status counts
  let countAnswered = 0;
  let countNotAnswered = 0;
  let countMarked = 0;
  let countMarkedAnswered = 0;
  let countNotVisited = 0;

  for (const item of items) {
    if (item.status === "ANSWERED") countAnswered++;
    else if (item.status === "NOT_ANSWERED") countNotAnswered++;
    else if (item.status === "MARKED_FOR_REVIEW") countMarked++;
    else if (item.status === "ANSWERED_AND_MARKED") countMarkedAnswered++;
    else countNotVisited++;
  }

  return (
    <div className="w-full lg:w-80 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden select-none">
      {/* Candidate Profile Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center font-bold text-white shadow-inner">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium">Candidate</p>
          <p className="text-sm font-bold text-white truncate">{candidateName}</p>
        </div>
      </div>

      {/* Palette Legend Counters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 text-xs space-y-2">
        <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
          Question Palette Legend
        </p>
        <div className="grid grid-cols-2 gap-2">
          {/* Answered */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {countAnswered}
            </span>
            <span className="font-medium text-slate-700">Answered</span>
          </div>

          {/* Not Answered */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-red-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {countNotAnswered}
            </span>
            <span className="font-medium text-slate-700">Not Answered</span>
          </div>

          {/* Marked for Review */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {countMarked}
            </span>
            <span className="font-medium text-slate-700">Marked Review</span>
          </div>

          {/* Answered & Marked */}
          <div className="flex items-center gap-2">
            <span className="relative w-6 h-6 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {countMarkedAnswered}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
            </span>
            <span className="font-medium text-slate-700 leading-tight">Ans & Marked</span>
          </div>

          {/* Not Visited */}
          <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-slate-200/60">
            <span className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs">
              {countNotVisited}
            </span>
            <span className="font-medium text-slate-700">Not Visited</span>
          </div>
        </div>
      </div>

      {/* Interactive Question Grid */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] lg:max-h-[500px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Choose a Question:
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {items.length} Total
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {items.map((item) => {
            const isCurrent = currentQuestionIndex === item.index;
            let bgClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";

            if (item.status === "ANSWERED") {
              bgClass = "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600";
            } else if (item.status === "NOT_ANSWERED") {
              bgClass = "bg-red-500 text-white hover:bg-red-600 border-red-500";
            } else if (item.status === "MARKED_FOR_REVIEW") {
              bgClass = "bg-purple-600 text-white hover:bg-purple-700 border-purple-600";
            } else if (item.status === "ANSWERED_AND_MARKED") {
              bgClass = "bg-purple-600 text-white hover:bg-purple-700 border-purple-600";
            } else if (item.status === "NOT_VISITED") {
              bgClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300";
            }

            return (
              <button
                key={item.index}
                onClick={() => onSelectQuestion(item.index)}
                className={`relative h-10 rounded-lg font-bold text-sm border flex items-center justify-center transition-all ${bgClass} ${
                  isCurrent
                    ? "ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-md z-10"
                    : "shadow-xs"
                }`}
              >
                {item.index + 1}
                {item.status === "ANSWERED_AND_MARKED" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
