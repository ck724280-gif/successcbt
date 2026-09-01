"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle2, Send, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils/cn";

export interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  timeRemainingSeconds: number;
  stats: {
    total: number;
    answered: number;
    notAnswered: number;
    markedForReview: number;
    notVisited: number;
  };
}

export function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting,
  timeRemainingSeconds,
  stats,
}: SubmitConfirmModalProps) {
  const hasUnattempted = stats.notAnswered + stats.notVisited > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Test Confirmation"
      description="Are you sure you want to finish and submit your test?"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Time Remaining Callout */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Time Remaining:
          </span>
          <span className="font-mono text-base font-bold">{formatTime(timeRemainingSeconds)}</span>
        </div>

        {/* Warning if unattempted */}
        {hasUnattempted && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">You still have unattempted questions.</p>
              <p className="text-amber-800 mt-0.5">
                You have {stats.notAnswered + stats.notVisited} questions left unattempted. Once submitted, you cannot resume this test.
              </p>
            </div>
          </div>
        )}

        {/* Summary Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
          <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 text-xs uppercase tracking-wider">
            Attempt Summary
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white">
              <span className="text-slate-600 font-medium">Total Questions</span>
              <span className="font-bold text-slate-900">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/50">
              <span className="text-emerald-800 font-medium">Answered Questions</span>
              <span className="font-bold text-emerald-700">{stats.answered}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-red-50/50">
              <span className="text-red-800 font-medium">Not Answered</span>
              <span className="font-bold text-red-700">{stats.notAnswered}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50/50">
              <span className="text-purple-800 font-medium">Marked for Review</span>
              <span className="font-bold text-purple-700">{stats.markedForReview}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50">
              <span className="text-slate-600 font-medium">Not Visited</span>
              <span className="font-bold text-slate-700">{stats.notVisited}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="font-semibold"
        >
          Cancel & Continue Test
        </Button>
        <Button
          variant="success"
          onClick={onConfirmSubmit}
          isLoading={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-500 font-bold gap-1.5 shadow-sm"
        >
          <Send className="w-4 h-4" />
          Yes, Final Submit
        </Button>
      </div>
    </Modal>
  );
}
