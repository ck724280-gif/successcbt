"use client";

import React from "react";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TimeExpiredModalProps {
  isOpen: boolean;
  onAutoSubmit: () => void;
  isSubmitting: boolean;
}

export function TimeExpiredModal({
  isOpen,
  onAutoSubmit,
  isSubmitting,
}: TimeExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900">
            Time's Up! Test Expired
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            The allotted test duration has completed. Your responses are being finalized and submitted for evaluation.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="lg"
            onClick={onAutoSubmit}
            isLoading={isSubmitting}
            className="w-full font-bold shadow-md shadow-red-500/20"
          >
            {isSubmitting ? "Evaluating Results..." : "Submit & View Result"}
          </Button>
        </div>
      </div>
    </div>
  );
}
