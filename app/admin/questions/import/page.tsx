"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  UploadCloud,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Download,
  Copy,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

interface ParsedQuestionRow {
  id: string;
  question_en: string;
  question_hi?: string;
  opt_a_en: string;
  opt_a_hi?: string;
  opt_b_en: string;
  opt_b_hi?: string;
  opt_c_en?: string;
  opt_c_hi?: string;
  opt_d_en?: string;
  opt_d_hi?: string;
  answer: string;
  explanation_en?: string;
  explanation_hi?: string;
  difficulty?: string;
  marks?: number | string;
  negative_marks?: number | string;
  isValid: boolean;
  validationError?: string;
}

const SAMPLE_JSON = [
  {
    question_en: "Which planet is known as the Red Planet?",
    question_hi: "किस ग्रह को लाल ग्रह के नाम से जाना जाता है?",
    opt_a_en: "Venus",
    opt_a_hi: "शुक्र",
    opt_b_en: "Mars",
    opt_b_hi: "मंगल",
    opt_c_en: "Jupiter",
    opt_c_hi: "बृहस्पति",
    opt_d_en: "Saturn",
    opt_d_hi: "शनि",
    answer: "B",
    explanation_en: "Mars is known as the Red Planet.",
    explanation_hi: "मंगल को लाल ग्रह कहा जाता है।",
    difficulty: "EASY",
    marks: 2.0,
    negative_marks: 0.5
  },
  {
    question_en: "What is the capital of India?",
    question_hi: "भारत की राजधानी क्या है?",
    opt_a_en: "Mumbai",
    opt_a_hi: "मुंबई",
    opt_b_en: "Kolkata",
    opt_b_hi: "कोलकाता",
    opt_c_en: "New Delhi",
    opt_c_hi: "नई दिल्ली",
    opt_d_en: "Chennai",
    opt_d_hi: "चेन्नई",
    answer: "C",
    explanation_en: "New Delhi is the official capital of India.",
    explanation_hi: "नई दिल्ली भारत की आधिकारिक राजधानी है।",
    difficulty: "EASY",
    marks: 2.0,
    negative_marks: 0.5
  }
];

const SAMPLE_CSV = `question_en,question_hi,opt_a_en,opt_a_hi,opt_b_en,opt_b_hi,opt_c_en,opt_c_hi,opt_d_en,opt_d_hi,answer,explanation_en,explanation_hi,difficulty,marks,negative_marks
"Who wrote the Indian National Anthem?","भारत का राष्ट्रगान किसने लिखा था?","Rabindranath Tagore","रवींद्रनाथ टैगोर","Bankim Chandra","बंकिम चंद्र","Sarojini Naidu","सरोजिनी नायडू","Subhash Bose","सुभाष बोस","A","Written by Rabindranath Tagore.","रवींद्रनाथ टैगोर द्वारा लिखा गया।","EASY",2,0.5
"What is the SI unit of Force?","बल का SI मात्रक क्या है?","Joule","जूल","Newton","न्यूटन","Pascal","पास्कल","Watt","वाट","B","Newton (N) is the SI unit of force.","न्यूटन (N) बल का SI मात्रक है।","EASY",2,0.5`;

export default function BulkQuestionImportPage() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch("/api/admin/questions");
        const data = await res.json();
        if (data.success && data.data.questions.length > 0) {
          const sMap = new Map();
          for (const q of data.data.questions) {
            if (q.subject) sMap.set(q.subject.id, q.subject);
          }
          const list = Array.from(sMap.values());
          setSubjects(list);
          if (list.length > 0) setSubjectId(list[0].id);
        }
      } catch (e) {
        console.error("Load subjects error:", e);
      }
    }
    loadSubjects();
  }, []);

  // Validate a single row
  const validateRow = (row: any): { isValid: boolean; error?: string } => {
    if (!row.question_en || row.question_en.trim().length < 3) {
      return { isValid: false, error: "Question (EN) text is missing or too short." };
    }
    if (!row.opt_a_en || !row.opt_b_en) {
      return { isValid: false, error: "Option A and Option B are required." };
    }
    const ans = (row.answer || "").toString().trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(ans)) {
      return { isValid: false, error: `Invalid answer '${row.answer}'. Must be A, B, C, or D.` };
    }
    return { isValid: true };
  };

  // Parse Raw Text (JSON or CSV)
  const handleParseText = () => {
    if (!rawText.trim()) {
      toastError("Please paste or upload JSON / CSV data first.");
      return;
    }

    try {
      const trimmed = rawText.trim();
      let rawArray: any[] = [];

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        // Parse as JSON
        const parsed = JSON.parse(trimmed);
        rawArray = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Parse as CSV
        const csvRes = Papa.parse(trimmed, {
          header: true,
          skipEmptyLines: true,
        });
        rawArray = csvRes.data;
      }

      if (rawArray.length === 0) {
        toastError("No question rows found in the provided data.");
        return;
      }

      const validated: ParsedQuestionRow[] = rawArray.map((row, idx) => {
        const v = validateRow(row);
        return {
          id: `row-${idx}-${Date.now()}`,
          question_en: row.question_en || row.question || "",
          question_hi: row.question_hi || "",
          opt_a_en: row.opt_a_en || row.opt_a || row.option_a || "",
          opt_a_hi: row.opt_a_hi || "",
          opt_b_en: row.opt_b_en || row.opt_b || row.option_b || "",
          opt_b_hi: row.opt_b_hi || "",
          opt_c_en: row.opt_c_en || row.opt_c || row.option_c || "",
          opt_c_hi: row.opt_c_hi || "",
          opt_d_en: row.opt_d_en || row.opt_d || row.option_d || "",
          opt_d_hi: row.opt_d_hi || "",
          answer: (row.answer || "A").toString().trim().toUpperCase(),
          explanation_en: row.explanation_en || row.explanation || "",
          explanation_hi: row.explanation_hi || "",
          difficulty: row.difficulty || "MEDIUM",
          marks: row.marks || 2.0,
          negative_marks: row.negative_marks || 0.5,
          isValid: v.isValid,
          validationError: v.error,
        };
      });

      setParsedRows(validated);
      toast(`Successfully parsed and validated ${validated.length} questions.`, "success");
    } catch (err: any) {
      console.error("Parse Error:", err);
      toastError(`Failed to parse data: ${err.message}`);
    }
  };

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      toast(`File "${file.name}" loaded. Click "Validate & Preview" to inspect.`, "info");
    };
    reader.readAsText(file);
  };

  // Inline row edit
  const handleRowChange = (id: string, field: keyof ParsedQuestionRow, val: string) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: val };
          const v = validateRow(updated);
          return { ...updated, isValid: v.isValid, validationError: v.error };
        }
        return row;
      })
    );
  };

  // Delete row from preview
  const handleDeleteRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Commit Import to Database
  const handleCommitImport = async () => {
    if (!subjectId) {
      toastError("Please select a target Subject for these questions.");
      return;
    }

    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toastError("No valid questions found to import.");
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);

      const payload = {
        subjectId,
        questions: validRows.map((r) => ({
          question_en: r.question_en,
          question_hi: r.question_hi || "",
          opt_a_en: r.opt_a_en,
          opt_a_hi: r.opt_a_hi || "",
          opt_b_en: r.opt_b_en,
          opt_b_hi: r.opt_b_hi || "",
          opt_c_en: r.opt_c_en || "",
          opt_c_hi: r.opt_c_hi || "",
          opt_d_en: r.opt_d_en || "",
          opt_d_hi: r.opt_d_hi || "",
          answer: r.answer,
          explanation_en: r.explanation_en || "",
          explanation_hi: r.explanation_hi || "",
          difficulty: r.difficulty || "MEDIUM",
          marks: Number(r.marks) || 2.0,
          negative_marks: Number(r.negative_marks) || 0.5,
        })),
      };

      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Bulk import failed.");
      }

      setImportResult(data.data);
      toast(`Import complete: ${data.data.importedCount} questions inserted!`, "success");
      setParsedRows([]);
      setRawText("");
    } catch (err: any) {
      toastError(err.message || "Error importing questions.");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Question Bank
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bulk Question Import Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload hundreds of bilingual questions via JSON or CSV with automated schema validation and duplicate checking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawText(JSON.stringify(SAMPLE_JSON, null, 2));
                toast("Sample JSON loaded into editor!", "info");
              }}
              className="text-xs font-bold"
            >
              Load Sample JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawText(SAMPLE_CSV);
                toast("Sample CSV loaded into editor!", "info");
              }}
              className="text-xs font-bold"
            >
              Load Sample CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Target Subject Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase">
            Step 1: Choose Destination Subject
          </h3>
          <p className="text-xs text-slate-500">
            Imported questions will be mapped to this subject taxonomy
          </p>
        </div>

        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-blue-900 bg-blue-50/50 min-w-[260px]"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code || "SUBJ"})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: File Upload / Raw Paste Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Step 2: Upload File or Paste Raw JSON / CSV
          </h3>
          <input
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleFileUpload}
            className="text-xs font-semibold text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <textarea
          rows={7}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Paste JSON array [ { "question_en": "...", "opt_a_en": "...", "answer": "A" } ] or CSV rows here...`}
          className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleParseText}
            className="font-bold gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Validate & Preview ({rawText ? "Data Ready" : "Paste Data First"})
          </Button>
        </div>
      </div>

      {/* Import Result Notification */}
      {importResult && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-black text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Bulk Import Completed Successfully!
          </div>
          <div className="text-xs space-y-1 text-emerald-800">
            <p>• Inserted: <strong>{importResult.importedCount}</strong> questions into the database.</p>
            {importResult.skippedCount > 0 && (
              <p>• Skipped <strong>{importResult.skippedCount}</strong> duplicate questions.</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Live Preview & Inline Correction Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Step 3: Live Preview & Error Verification ({parsedRows.length} Total)
              </h3>
              <p className="text-xs text-slate-500">
                You can edit any cell directly before finalizing the database commit
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs font-bold">
                {validCount} Ready to Import
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="danger" className="text-xs font-bold">
                  {invalidCount} Needs Correction
                </Badge>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[500px] border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-900 text-white shadow-sm z-10">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 min-w-[220px]">Question (English)</th>
                  <th className="py-3 px-3 min-w-[120px]">Opt A</th>
                  <th className="py-3 px-3 min-w-[120px]">Opt B</th>
                  <th className="py-3 px-3 min-w-[120px]">Opt C</th>
                  <th className="py-3 px-3 min-w-[120px]">Opt D</th>
                  <th className="py-3 px-2 text-center">Ans</th>
                  <th className="py-3 px-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {parsedRows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`transition-colors ${
                      !r.isValid ? "bg-red-50/70" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      {r.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div title={r.validationError} className="flex items-center gap-1 text-red-600 font-bold">
                          <XCircle className="w-4 h-4" />
                          <span className="text-[10px] hidden sm:inline truncate max-w-[100px]">
                            {r.validationError}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={r.question_en}
                        onChange={(e) => handleRowChange(r.id, "question_en", e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={r.opt_a_en}
                        onChange={(e) => handleRowChange(r.id, "opt_a_en", e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={r.opt_b_en}
                        onChange={(e) => handleRowChange(r.id, "opt_b_en", e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={r.opt_c_en || ""}
                        onChange={(e) => handleRowChange(r.id, "opt_c_en", e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={r.opt_d_en || ""}
                        onChange={(e) => handleRowChange(r.id, "opt_d_en", e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="text"
                        maxLength={1}
                        value={r.answer}
                        onChange={(e) => handleRowChange(r.id, "answer", e.target.value.toUpperCase())}
                        className="w-8 p-1 text-center font-black rounded border border-slate-300 text-xs uppercase"
                      />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(r.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final Commit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-semibold">
              {validCount} valid questions will be created in the selected subject.
            </p>

            <Button
              variant="success"
              size="lg"
              onClick={handleCommitImport}
              isLoading={isImporting}
              disabled={validCount === 0}
              className="w-full sm:w-auto font-bold px-8 bg-emerald-600 hover:bg-emerald-500 shadow-md gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Commit {validCount} Questions to DB
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
