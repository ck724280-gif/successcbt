"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Star, Clock, Globe, Bookmark, Flag, ChevronDown, BarChart2 } from "lucide-react";
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
  return (
    <header className="w-full select-none sticky top-0 z-40 shadow-xs">
      {/* 1. Main Teal Navbar (Testbook Screenshot 4 & 5 #0097a7) */}
      <div className="bg-[#0097a7] text-white px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Back Arrow & Test Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
            title="Exit Test"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100 block leading-none">
              Tests
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-sm sm:max-w-xl">
              {testTitle}
            </h1>
          </div>
        </div>

        {/* Right Controls: Star Rating, Timer & Analytics */}
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          {/* Rate Test Stars */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-teal-100">
            <span className="text-[11px] text-teal-100 mr-1">Rate the Test</span>
            <div className="flex text-teal-200">
              <Star className="w-3.5 h-3.5" />
              <Star className="w-3.5 h-3.5" />
              <Star className="w-3.5 h-3.5" />
              <Star className="w-3.5 h-3.5" />
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Real-time Countdown Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-white font-mono font-bold text-xs sm:text-sm border border-white/20">
            <Clock className="w-4 h-4 text-teal-200" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          {/* Analytics / Submit Button */}
          <button
            onClick={onSubmitClick}
            className="font-black text-xs uppercase tracking-wider bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/30 flex items-center gap-1.5 shadow-xs"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>ANALYTICS / SUBMIT</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Header Section & Language Bar (Testbook style) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Section Selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 text-xs">अनुभाग :</span>
          <div className="flex items-center gap-1">
            {sections.length > 0 ? (
              sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`px-3 py-1 rounded-md font-bold text-xs transition-colors ${
                    currentSectionId === sec.id
                      ? "bg-[#0e6065] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sec.title}
                </button>
              ))
            ) : (
              <span className="px-3 py-1 bg-[#0e6065] text-white font-bold rounded-md text-xs">
                Test
              </span>
            )}
          </div>
        </div>

        {/* Right: Language Dropdown & Report/Bookmark Icons */}
        <div className="flex items-center gap-4">
          {/* View in Language Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">View in</span>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => onToggleLanguage(e.target.value as "en" | "hi")}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <button className="flex items-center gap-1 hover:text-slate-800">
              <Bookmark className="w-3.5 h-3.5" />
              <span>सेव</span>
            </button>
            <button className="flex items-center gap-1 hover:text-slate-800">
              <Flag className="w-3.5 h-3.5" />
              <span>सूचित करें</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
