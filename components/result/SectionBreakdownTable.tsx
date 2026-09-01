"use client";

import React from "react";
import { formatScore } from "@/lib/utils/cn";

export interface SectionBreakdownItem {
  sectionId: string;
  title: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  positiveMarks: number;
  negativeMarks: number;
  score: number;
  accuracy: number;
}

export function SectionBreakdownTable({
  sections,
}: {
  sections: SectionBreakdownItem[];
}) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Section-wise Performance Breakdown
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Detailed topic and section analysis showing marks, speed, and accuracy
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Section</th>
              <th className="py-3.5 px-3 text-center">Questions</th>
              <th className="py-3.5 px-3 text-center">Attempted</th>
              <th className="py-3.5 px-3 text-center text-emerald-700">Correct</th>
              <th className="py-3.5 px-3 text-center text-red-700">Incorrect</th>
              <th className="py-3.5 px-3 text-center">Accuracy</th>
              <th className="py-3.5 px-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sections.map((sec) => (
              <tr key={sec.sectionId} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">{sec.title}</td>
                <td className="py-4 px-3 text-center text-slate-600">{sec.totalQuestions}</td>
                <td className="py-4 px-3 text-center text-slate-700">{sec.attempted}</td>
                <td className="py-4 px-3 text-center font-bold text-emerald-600 bg-emerald-50/40">
                  {sec.correct}
                </td>
                <td className="py-4 px-3 text-center font-bold text-red-600 bg-red-50/40">
                  {sec.incorrect}
                </td>
                <td className="py-4 px-3 text-center font-bold text-slate-800">
                  {sec.accuracy}%
                </td>
                <td className="py-4 px-4 text-right font-black text-blue-700 text-base">
                  {formatScore(sec.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
