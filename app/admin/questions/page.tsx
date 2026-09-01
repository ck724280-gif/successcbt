"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Plus,
  Search,
  UploadCloud,
  Loader2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/questions?search=${encodeURIComponent(search)}&limit=50`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data.questions);

          // Extract unique subjects
          const subjMap = new Map();
          for (const q of data.data.questions) {
            if (q.subject) subjMap.set(q.subject.id, q.subject.name);
          }
          setSubjects(Array.from(subjMap.entries()).map(([id, name]) => ({ id, name })));
        }
      } catch (e) {
        console.error("Load questions error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Question Bank Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized repository of bilingual competitive examination questions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/questions/import">
            <Button variant="outline" size="sm" className="font-bold gap-1.5 bg-white">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Bulk Import (JSON / CSV)
            </Button>
          </Link>
          <Link href="/admin/questions/new">
            <Button variant="primary" size="sm" className="font-bold gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              Add Single Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text or concept..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200">
            <p className="text-base font-bold text-slate-700">No questions found.</p>
            <Link href="/admin/questions/import">
              <Button variant="primary" size="sm">Import Questions Now</Button>
            </Link>
          </div>
        ) : (
          questions.map((q, idx) => {
            const correctOpt = q.options.find((o: any) => o.isCorrect);

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {q.subject?.name || "General"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      +{q.defaultMarks} / -{q.defaultNegativeMarks} Marks
                    </span>
                    <span className="text-slate-400">
                      Used in {q._count?.testQuestions || 0} Tests
                    </span>
                  </div>
                </div>

                {/* Bilingual Text */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {q.questionEn}
                  </p>
                  {q.questionHi && (
                    <p className="text-xs font-medium text-slate-600 italic">
                      {q.questionHi}
                    </p>
                  )}
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                        opt.isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] ${
                          opt.isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-white border text-slate-700"
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="truncate">{opt.contentEn}</span>
                    </div>
                  ))}
                </div>

                {/* Explanation preview */}
                {q.explanationEn && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800">Explanation: </strong>
                    {q.explanationEn}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
