"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function AddQuestionPage() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question fields
  const [subjectId, setSubjectId] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [questionHi, setQuestionHi] = useState("");
  const [explanationEn, setExplanationEn] = useState("");
  const [explanationHi, setExplanationHi] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [marks, setMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);

  // Options
  const [options, setOptions] = useState([
    { optionKey: "A", contentEn: "", contentHi: "", isCorrect: true },
    { optionKey: "B", contentEn: "", contentHi: "", isCorrect: false },
    { optionKey: "C", contentEn: "", contentHi: "", isCorrect: false },
    { optionKey: "D", contentEn: "", contentHi: "", isCorrect: false },
  ]);

  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true);
        const res = await fetch("/api/exams");
        const data = await res.json();
        // Also fetch question subjects
        const qRes = await fetch("/api/admin/questions");
        const qData = await qRes.json();
        if (qData.success && qData.data.questions.length > 0) {
          const sMap = new Map();
          for (const q of qData.data.questions) {
            if (q.subject) sMap.set(q.subject.id, q.subject);
          }
          const sList = Array.from(sMap.values());
          setSubjects(sList);
          if (sList.length > 0) setSubjectId(sList[0].id);
        }
      } catch (e) {
        console.error("Load subjects error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  const handleSetCorrect = (key: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.optionKey === key,
      }))
    );
  };

  const handleOptionChange = (key: string, field: "contentEn" | "contentHi", value: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.optionKey === key ? { ...opt, [field]: value } : opt))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId || !questionEn) {
      toastError("Subject and English Question text are required.");
      return;
    }

    if (!options[0].contentEn || !options[1].contentEn) {
      toastError("At least Option A and Option B must be filled.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        subjectId,
        questionEn,
        questionHi: questionHi || null,
        explanationEn: explanationEn || null,
        explanationHi: explanationHi || null,
        difficulty,
        defaultMarks: Number(marks),
        defaultNegativeMarks: Number(negativeMarks),
        options: options.map((opt, idx) => ({
          optionKey: opt.optionKey,
          contentEn: opt.contentEn,
          contentHi: opt.contentHi || null,
          isCorrect: opt.isCorrect,
          orderIndex: idx,
        })),
      };

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create question.");
      }

      toast("Question added to Question Bank successfully!", "success");
      router.push("/admin/questions");
    } catch (err: any) {
      toastError(err.message || "Error creating question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/admin/questions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Question Bank
      </Link>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Add Single Bilingual Question
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create a standalone question with dual English & Hindi text, options, and explanation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject & Difficulty */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">Subject *</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">Marks / Neg</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.25"
                value={marks}
                onChange={(e) => setMarks(parseFloat(e.target.value) || 2.0)}
                placeholder="+2.0"
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
              />
              <input
                type="number"
                step="0.25"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0.5)}
                placeholder="-0.5"
                className="w-1/2 p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-red-700"
              />
            </div>
          </div>
        </div>

        {/* Question Text (EN & HI) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Question Text (English) *
            </label>
            <textarea
              rows={3}
              required
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              placeholder="e.g. Which planet is known as the Red Planet?"
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Question Text (हिन्दी) (Optional)
            </label>
            <textarea
              rows={3}
              value={questionHi}
              onChange={(e) => setQuestionHi(e.target.value)}
              placeholder="e.g. किस ग्रह को लाल ग्रह के नाम से जाना जाता है?"
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Options Setup */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Options (Choose Correct Answer)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click the radio button on the left to designate correct answer
            </span>
          </div>

          <div className="space-y-3">
            {options.map((opt) => (
              <div
                key={opt.optionKey}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  opt.isCorrect ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSetCorrect(opt.optionKey)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    opt.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 border"
                  }`}
                >
                  {opt.optionKey}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <input
                    type="text"
                    required={opt.optionKey === "A" || opt.optionKey === "B"}
                    value={opt.contentEn}
                    onChange={(e) => handleOptionChange(opt.optionKey, "contentEn", e.target.value)}
                    placeholder={`Option ${opt.optionKey} (English)`}
                    className="p-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
                  />
                  <input
                    type="text"
                    value={opt.contentHi}
                    onChange={(e) => handleOptionChange(opt.optionKey, "contentHi", e.target.value)}
                    placeholder={`Option ${opt.optionKey} (हिन्दी)`}
                    className="p-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
            Detailed Solution & Explanation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Explanation (English)</label>
              <textarea
                rows={3}
                value={explanationEn}
                onChange={(e) => setExplanationEn(e.target.value)}
                placeholder="Step-by-step logic in English..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Explanation (हिन्दी)</label>
              <textarea
                rows={3}
                value={explanationHi}
                onChange={(e) => setExplanationHi(e.target.value)}
                placeholder="विस्तृत व्याख्या हिन्दी में..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/questions">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="font-bold px-8 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Question
          </Button>
        </div>
      </form>
    </div>
  );
}
