"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function CreateTestPage() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [loadingExams, setLoadingExams] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [examId, setExamId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState(
    "1. All questions carry equal marks.\n2. Negative marking applies for incorrect answers.\n3. The test will auto-submit on timer expiry."
  );
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passPercentage, setPassPercentage] = useState(40);
  const [positiveMarks, setPositiveMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [isNegativeMarking, setIsNegativeMarking] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const genSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(genSlug);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingExams(true);
        // Fetch exams
        const resExams = await fetch("/api/exams");
        const dataExams = await resExams.json();
        if (dataExams.success) {
          const allExams: any[] = [];
          for (const cat of dataExams.data) {
            allExams.push(...cat.exams);
          }
          setExams(allExams);
          if (allExams.length > 0) setExamId(allExams[0].id);
        }

        // Fetch question bank
        const resQ = await fetch("/api/admin/questions?limit=100");
        const dataQ = await resQ.json();
        if (dataQ.success) {
          setAvailableQuestions(dataQ.data.questions);
          // By default, select first 10 questions if available
          setSelectedQuestionIds(dataQ.data.questions.slice(0, 10).map((q: any) => q.id));
        }
      } catch (e) {
        console.error("Load create test data error:", e);
      } finally {
        setLoadingExams(false);
      }
    }
    loadData();
  }, []);

  const toggleQuestionSelection = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSelectAllQuestions = () => {
    if (selectedQuestionIds.length === availableQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(availableQuestions.map((q) => q.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examId || !title || !slug) {
      toastError("Please fill in the required fields (Exam, Title, and Slug).");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      toastError("Please select at least one question to include in this test.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        examId,
        title,
        slug,
        description,
        instructions,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passPercentage: Number(passPercentage),
        positiveMarksPerQ: Number(positiveMarks),
        negativeMarksPerQ: Number(negativeMarks),
        isNegativeMarking,
        isPublished,
        isFree: true,
        sections: [
          {
            title: "General Test Section",
            positiveMarks: Number(positiveMarks),
            negativeMarks: Number(negativeMarks),
            questionIds: selectedQuestionIds,
          },
        ],
      };

      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create mock test.");
      }

      toast("Mock Test created and published successfully!", "success");
      router.push("/admin/tests");
    } catch (err: any) {
      toastError(err.message || "Error creating test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingExams) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading wizard data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/admin/tests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tests List
        </Link>
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create New Mock Test
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure test metadata, timer rules, negative marking, and map questions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Basic Metadata Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Test Information & Target Exam
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Target Exam *</label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.code || "No code"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Test Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. SSC CGL Full Mock Test 02"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. ssc-cgl-full-mock-02"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Publish Status</label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Description / Syllabus</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the test syllabus or coverage..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">General Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>
        </div>

        {/* 2. Timing & Scoring Scheme */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. Duration, Total Marks & Negative Marking
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Duration (Minutes)</label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Total Marks</label>
              <input
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 100)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">+ Marks / Question</label>
              <input
                type="number"
                step="0.25"
                min={0.1}
                value={positiveMarks}
                onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 2.0)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">- Negative Marks</label>
              <input
                type="number"
                step="0.25"
                min={0}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0.5)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-red-700"
              />
            </div>
          </div>
        </div>

        {/* 3. Question Bank Selection */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                3. Map Questions to Test ({selectedQuestionIds.length} Selected)
              </h2>
              <p className="text-xs text-slate-500">
                Select questions from the Question Bank to include in this test
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllQuestions}
              className="text-xs font-bold"
            >
              {selectedQuestionIds.length === availableQuestions.length ? "Deselect All" : "Select All Available"}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {availableQuestions.map((q, idx) => {
              const isSelected = selectedQuestionIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestionSelection(q.id)}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 mt-1 text-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400">Q.{idx + 1}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {q.subject?.name || "General"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {q.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-slate-800 line-clamp-2">
                      {q.questionEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/tests">
            <Button variant="outline" type="button" className="font-semibold">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="font-bold px-8 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Publish Test
          </Button>
        </div>
      </form>
    </div>
  );
}
