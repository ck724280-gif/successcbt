"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminTestsPage() {
  const { toast, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const loadTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tests?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (e) {
      console.error("Admin tests error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [search]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Test ${!currentStatus ? "published" : "unpublished"} successfully.`, "success");
        loadTests();
      }
    } catch (e) {
      toastError("Failed to update test status.");
    }
  };

  const handleDeleteTest = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Test deleted successfully.", "success");
        loadTests();
      }
    } catch (e) {
      toastError("Failed to delete test.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage Mock Tests & Series
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, publish, modify, and configure time and marks rules for tests
          </p>
        </div>

        <Link href="/admin/tests/new">
          <Button variant="primary" size="sm" className="font-bold gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            Create New Test
          </Button>
        </Link>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test name or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-700">No mock tests found.</p>
            <Link href="/admin/tests/new">
              <Button variant="primary" size="sm">Create First Test</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Test Title</th>
                  <th className="pb-3 px-2 text-center">Exam</th>
                  <th className="pb-3 px-2 text-center">Questions</th>
                  <th className="pb-3 px-2 text-center">Duration</th>
                  <th className="pb-3 px-2 text-center">Marks</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-900">{t.title}</p>
                      <span className="text-xs text-slate-400 font-mono">/{t.slug}</span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {t.exam?.title || "Exam"}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-slate-700">
                      {t._count.testQuestions} Qs
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-slate-700">
                      {t.durationMinutes} mins
                    </td>
                    <td className="py-4 px-2 text-center font-black text-slate-900">
                      {t.totalMarks}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button
                        onClick={() => handleTogglePublish(t.id, t.isPublished)}
                        className="transition-transform active:scale-95"
                      >
                        <Badge
                          variant={t.isPublished ? "success" : "secondary"}
                          className="cursor-pointer hover:opacity-80 text-xs font-bold"
                        >
                          {t.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/tests/${t.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600" title="Preview Student View">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDeleteTest(t.id, t.title)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
