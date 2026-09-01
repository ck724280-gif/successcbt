"use client";

import React from "react";
import { Clock, FileText, Send, Globe } from "lucide-react";
import { formatTime } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

export interface CBTHeaderProps {
  testTitle: string;
  sections: Array<{ id: string; title: string; orderIndex: number }>;
  currentSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  timeRemainingSeconds: number;
  selectedLanguage: "en" | "hi";
  onToggleLanguage: (lang: "en" | "hi") => void;
  onOpenQuestionPaper: () => void;
  onSubmitClick: () => void;
}

export function CBTHeader({
  testTitle,
  sections,
  currentSectionId,
  onSelectSection,
  timeRemainingSeconds,
  selectedLanguage,
  onToggleLanguage,
  onOpenQuestionPaper,
  onSubmitClick,
}: CBTHeaderProps) {
  const isLowTime = timeRemainingSeconds <= 300 && timeRemainingSeconds > 0; // Less than 5 mins
  const isCriticalTime = timeRemainingSeconds <= 60 && timeRemainingSeconds > 0; // Less than 1 min

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md select-none sticky top-0 z-30">
      {/* Top Bar: Title, Language Switcher, Timer, Actions */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Test Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider">
            CBT Exam
          </div>
          <h1 className="text-sm md:text-base font-bold text-white tracking-tight truncate max-w-[280px] sm:max-w-md md:max-w-lg">
            {testTitle}
          </h1>
        </div>

        {/* Center/Right Controls: Language Toggle + Timer + Submit */}
        <div className="flex items-center gap-3 sm:gap-5 ml-auto">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => onToggleLanguage("en")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedLanguage === "en"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => onToggleLanguage("hi")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedLanguage === "hi"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Question Paper View Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQuestionPaper}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs hidden sm:flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Question Paper
          </Button>

          {/* Real-time Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm sm:text-base transition-colors ${
              isCriticalTime
                ? "bg-red-950/80 border-red-500 text-red-300 animate-pulse"
                : isLowTime
                ? "bg-amber-950/80 border-amber-500 text-amber-300"
                : "bg-slate-800/90 border-slate-700 text-emerald-400"
            }`}
          >
            <Clock className={`w-4 h-4 ${isCriticalTime ? "text-red-400" : isLowTime ? "text-amber-400" : "text-emerald-400"}`} />
            <span>Time Left: {formatTime(timeRemainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <Button
            variant="success"
            size="sm"
            onClick={onSubmitClick}
            className="font-bold text-xs sm:text-sm px-4 bg-emerald-600 hover:bg-emerald-500 gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Test
          </Button>
        </div>
      </div>

      {/* Bottom Section Tabs Bar (if test has multiple sections) */}
      {sections.length > 1 && (
        <div className="bg-slate-950/60 border-t border-slate-800 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 mr-2 flex-shrink-0">
            Sections:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  currentSectionId === sec.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
