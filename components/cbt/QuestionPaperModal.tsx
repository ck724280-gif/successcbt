"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface QuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTitle: string;
  questions: Array<{
    questionIndex: number;
    subjectName?: string | null;
    questionEn: string;
    questionHi?: string | null;
    marks: number;
    negativeMarks: number;
    options: Array<{
      optionKey: string;
      contentEn: string;
      contentHi?: string | null;
    }>;
  }>;
  selectedLanguage: "en" | "hi";
  onJumpToQuestion: (index: number) => void;
}

export function QuestionPaperModal({
  isOpen,
  onClose,
  testTitle,
  questions,
  selectedLanguage,
  onJumpToQuestion,
}: QuestionPaperModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Question Paper"
      description={`${testTitle} — View all questions in one place`}
      maxWidth="4xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {questions.map((q) => {
          const isHindi = selectedLanguage === "hi" && Boolean(q.questionHi);
          const qText = isHindi ? q.questionHi! : q.questionEn;

          return (
            <div
              key={q.questionIndex}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                    Q.{q.questionIndex + 1}
                  </span>
                  {q.subjectName && (
                    <Badge variant="secondary" className="text-xs">
                      {q.subjectName}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-emerald-700">+{q.marks}</span>
                  <span className="text-red-700">-{q.negativeMarks}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-blue-600 font-bold hover:bg-blue-50"
                    onClick={() => {
                      onJumpToQuestion(q.questionIndex);
                      onClose();
                    }}
                  >
                    Jump to Question →
                  </Button>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {qText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.optionKey}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200"
                  >
                    <span className="w-5 h-5 rounded bg-slate-100 border font-bold text-slate-700 flex items-center justify-center">
                      {opt.optionKey}
                    </span>
                    <span className="text-slate-800">
                      {isHindi && opt.contentHi ? opt.contentHi : opt.contentEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close Preview
        </Button>
      </div>
    </Modal>
  );
}
