"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CBTHeader } from "@/components/cbt/CBTHeader";
import { QuestionCanvas } from "@/components/cbt/QuestionCanvas";
import { QuestionPalette, QuestionPaletteItem, QuestionStatusType } from "@/components/cbt/QuestionPalette";
import { QuestionPaperModal } from "@/components/cbt/QuestionPaperModal";
import { SubmitConfirmModal } from "@/components/cbt/SubmitConfirmModal";
import { TimeExpiredModal } from "@/components/cbt/TimeExpiredModal";
import { useToast } from "@/components/providers/ToastProvider";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuestionData {
  questionIndex: number;
  questionId: string;
  testQuestionId: string;
  sectionId?: string | null;
  marks: number;
  negativeMarks: number;
  subjectId: string;
  subjectName?: string | null;
  topicName?: string | null;
  difficulty: string;
  type: string;
  questionEn: string;
  questionHi?: string | null;
  options: Array<{
    id: string;
    optionKey: string;
    contentEn: string;
    contentHi?: string | null;
    orderIndex: number;
  }>;
}

interface SavedAnswerState {
  selectedOptionKey: string | null;
  markedForReview: boolean;
  isVisited: boolean;
  isAnswered: boolean;
  timeSpentSeconds: number;
}

export default function CBTExamPage() {
  const params = useParams();
  const attemptId = params?.attemptId as string;
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { toast, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Exam environment state
  const [testTitle, setTestTitle] = useState("");
  const [sections, setSections] = useState<Array<{ id: string; title: string; orderIndex: number }>>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en");

  // Candidate answer store: questionId -> SavedAnswerState
  const [answers, setAnswers] = useState<Record<string, SavedAnswerState>>({});

  // Countdown timer state
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(3600);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Modals state
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question timer reference
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch attempt environment
  const loadAttemptData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/attempts/${attemptId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load examination environment.");
      }

      const payload = data.data;

      // If test is already submitted, redirect directly to result
      if (payload.attempt.status === "SUBMITTED") {
        router.replace(`/result/${attemptId}`);
        return;
      }

      setTestTitle(payload.attempt.testTitle);
      setSections(payload.sections || []);
      setQuestions(payload.questions || []);

      // Restore saved answers
      const initialAnswers: Record<string, SavedAnswerState> = {};
      for (const q of payload.questions) {
        const saved = payload.savedAnswers?.[q.questionId];
        initialAnswers[q.questionId] = {
          selectedOptionKey: saved?.selectedOptionKey || null,
          markedForReview: Boolean(saved?.markedForReview),
          isVisited: saved ? Boolean(saved.isVisited) : q.questionIndex === 0,
          isAnswered: Boolean(saved?.isAnswered),
          timeSpentSeconds: saved?.timeSpentSeconds || 0,
        };
      }
      setAnswers(initialAnswers);

      // Restore question index
      const savedIndex = payload.attempt.currentQuestionIndex || 0;
      setCurrentIndex(Math.min(savedIndex, (payload.questions.length || 1) - 1));

      // Restore countdown timer
      const remainingSecs = payload.attempt.timeRemainingSeconds;
      setTimeRemainingSeconds(remainingSecs);
      if (remainingSecs <= 0 || payload.attempt.isExpired) {
        setIsTimeExpired(true);
      }
    } catch (err: any) {
      console.error("Load CBT Attempt Error:", err);
      setErrorMessage(err.message || "Error loading examination.");
    } finally {
      setLoading(false);
    }
  }, [attemptId, router]);

  useEffect(() => {
    if (attemptId && authStatus === "authenticated") {
      loadAttemptData();
    } else if (authStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=/test/${attemptId}`);
    }
  }, [attemptId, authStatus, loadAttemptData, router]);

  // Live Timer Countdown Interval
  useEffect(() => {
    if (loading || isTimeExpired) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setIsTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [loading, isTimeExpired]);

  // Handle saving answer state to server
  const persistAnswer = async (
    questionId: string,
    state: SavedAnswerState,
    nextIndex?: number
  ) => {
    try {
      const q = questions.find((item) => item.questionId === questionId);
      await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          sectionId: q?.sectionId || null,
          selectedOptionKey: state.selectedOptionKey,
          markedForReview: state.markedForReview,
          isVisited: true,
          isAnswered: state.isAnswered,
          timeSpentSeconds: state.timeSpentSeconds,
          currentQuestionIndex: typeof nextIndex === "number" ? nextIndex : currentIndex,
        }),
      });
    } catch (e) {
      console.error("Auto-save answer background error:", e);
    }
  };

  // Option selection
  const handleSelectOption = (optionKey: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const currentAns = prev[currentQ.questionId] || {
        selectedOptionKey: null,
        markedForReview: false,
        isVisited: true,
        isAnswered: false,
        timeSpentSeconds: 0,
      };

      const updated = {
        ...currentAns,
        selectedOptionKey: optionKey,
        isAnswered: true,
        isVisited: true,
      };

      // Auto-save
      persistAnswer(currentQ.questionId, updated);
      return { ...prev, [currentQ.questionId]: updated };
    });
  };

  // Clear Response
  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const currentAns = prev[currentQ.questionId];
      const updated = {
        ...currentAns,
        selectedOptionKey: null,
        isAnswered: false,
      };

      persistAnswer(currentQ.questionId, updated);
      return { ...prev, [currentQ.questionId]: updated };
    });
  };

  // Save & Next Action
  const handleSaveAndNext = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    // Track time spent on current question
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();

    const currentAns = answers[currentQ.questionId] || {
      selectedOptionKey: null,
      markedForReview: false,
      isVisited: true,
      isAnswered: false,
      timeSpentSeconds: 0,
    };

    const updated = {
      ...currentAns,
      isVisited: true,
      isAnswered: Boolean(currentAns.selectedOptionKey),
      timeSpentSeconds: (currentAns.timeSpentSeconds || 0) + timeSpent,
    };

    const nextIndex = currentIndex < questions.length - 1 ? currentIndex + 1 : currentIndex;

    persistAnswer(currentQ.questionId, updated, nextIndex);

    setAnswers((prev) => ({
      ...prev,
      [currentQ.questionId]: updated,
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(nextIndex);
    } else {
      setIsSubmitConfirmOpen(true);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();

    const currentAns = answers[currentQ.questionId] || {
      selectedOptionKey: null,
      markedForReview: false,
      isVisited: true,
      isAnswered: false,
      timeSpentSeconds: 0,
    };

    const updated = {
      ...currentAns,
      markedForReview: true,
      isVisited: true,
      isAnswered: Boolean(currentAns.selectedOptionKey),
      timeSpentSeconds: (currentAns.timeSpentSeconds || 0) + timeSpent,
    };

    const nextIndex = currentIndex < questions.length - 1 ? currentIndex + 1 : currentIndex;

    persistAnswer(currentQ.questionId, updated, nextIndex);

    setAnswers((prev) => ({
      ...prev,
      [currentQ.questionId]: updated,
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(nextIndex);
    }
  };

  // Previous Action
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Direct Jump to Question
  const handleSelectQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      // Mark selected question as visited
      const targetQ = questions[index];
      if (targetQ) {
        setAnswers((prev) => {
          const currentAns = prev[targetQ.questionId] || {
            selectedOptionKey: null,
            markedForReview: false,
            isVisited: false,
            isAnswered: false,
            timeSpentSeconds: 0,
          };
          const updated = { ...currentAns, isVisited: true };
          persistAnswer(targetQ.questionId, updated, index);
          return { ...prev, [targetQ.questionId]: updated };
        });
      }
      setCurrentIndex(index);
    }
  };

  // Jump to Section
  const handleSelectSection = (sectionId: string) => {
    const firstQInSectionIndex = questions.findIndex((q) => q.sectionId === sectionId);
    if (firstQInSectionIndex !== -1) {
      handleSelectQuestion(firstQInSectionIndex);
    }
  };

  // Submit Test Action
  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Package all current answers
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        selectedOptionKey: val.selectedOptionKey,
        markedForReview: val.markedForReview,
        timeSpentSeconds: val.timeSpentSeconds,
      }));

      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit test");
      }

      toast("Test evaluated successfully! Loading scorecard...", "success");
      router.replace(`/result/${attemptId}`);
    } catch (err: any) {
      console.error("Submit Test Error:", err);
      toastError(err.message || "Submission failed. Please retry.");
      setIsSubmitting(false);
    }
  };

  // Compute Palette Item states
  const paletteItems: QuestionPaletteItem[] = questions.map((q, idx) => {
    const ans = answers[q.questionId];
    let status: QuestionStatusType = "NOT_VISITED";

    if (ans) {
      const hasSelection = Boolean(ans.selectedOptionKey);
      if (ans.markedForReview && hasSelection) {
        status = "ANSWERED_AND_MARKED";
      } else if (ans.markedForReview) {
        status = "MARKED_FOR_REVIEW";
      } else if (hasSelection) {
        status = "ANSWERED";
      } else if (ans.isVisited) {
        status = "NOT_ANSWERED";
      } else {
        status = "NOT_VISITED";
      }
    }

    return {
      index: idx,
      questionId: q.questionId,
      status,
      sectionId: q.sectionId,
    };
  });

  // Calculate palette summary counts for confirmation modal
  const submitStats = {
    total: questions.length,
    answered: paletteItems.filter((p) => p.status === "ANSWERED" || p.status === "ANSWERED_AND_MARKED").length,
    notAnswered: paletteItems.filter((p) => p.status === "NOT_ANSWERED").length,
    markedForReview: paletteItems.filter((p) => p.status === "MARKED_FOR_REVIEW").length,
    notVisited: paletteItems.filter((p) => p.status === "NOT_VISITED").length,
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-lg font-bold">Initializing CBT Test Environment...</p>
          <p className="text-xs text-slate-400">Loading questions, options, and restoring session state</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-100 p-6">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Exam Loading Error</h3>
          <p className="text-sm text-slate-600">{errorMessage}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="primary" onClick={() => loadAttemptData()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.questionId] : null;

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-screen">
      {/* CBT Header */}
      <CBTHeader
        testTitle={testTitle}
        sections={sections}
        currentSectionId={currentQuestion?.sectionId || null}
        onSelectSection={handleSelectSection}
        timeRemainingSeconds={timeRemainingSeconds}
        selectedLanguage={selectedLanguage}
        onToggleLanguage={setSelectedLanguage}
        onOpenQuestionPaper={() => setIsQuestionPaperOpen(true)}
        onSubmitClick={() => setIsSubmitConfirmOpen(true)}
      />

      {/* CBT Main Examination Workspace */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Question Canvas */}
        {currentQuestion && (
          <QuestionCanvas
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            question={currentQuestion}
            selectedOptionKey={currentAnswer?.selectedOptionKey || null}
            markedForReview={Boolean(currentAnswer?.markedForReview)}
            selectedLanguage={selectedLanguage}
            onSelectOption={handleSelectOption}
            onClearResponse={handleClearResponse}
            onMarkForReviewAndNext={handleMarkForReviewAndNext}
            onSaveAndNext={handleSaveAndNext}
            onPrevious={handlePrevious}
            isFirstQuestion={currentIndex === 0}
            isLastQuestion={currentIndex === questions.length - 1}
          />
        )}

        {/* Right: Question Palette */}
        <QuestionPalette
          candidateName={session?.user?.name || "Candidate"}
          items={paletteItems}
          currentQuestionIndex={currentIndex}
          onSelectQuestion={handleSelectQuestion}
        />
      </main>

      {/* Question Paper Modal */}
      <QuestionPaperModal
        isOpen={isQuestionPaperOpen}
        onClose={() => setIsQuestionPaperOpen(false)}
        testTitle={testTitle}
        questions={questions}
        selectedLanguage={selectedLanguage}
        onJumpToQuestion={handleSelectQuestion}
      />

      {/* Submit Test Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirmSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
        timeRemainingSeconds={timeRemainingSeconds}
        stats={submitStats}
      />

      {/* Time Expired Modal */}
      <TimeExpiredModal
        isOpen={isTimeExpired}
        onAutoSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
