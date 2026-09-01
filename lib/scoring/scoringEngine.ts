export interface QuestionToEvaluate {
  questionId: string;
  sectionId?: string | null;
  sectionTitle?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  marks: number;
  negativeMarks: number;
  correctOptionKey: string; // "A", "B", "C", "D"
}

export interface UserSubmittedAnswer {
  questionId: string;
  selectedOptionKey?: string | null;
  markedForReview?: boolean;
  timeSpentSeconds?: number;
}

export interface QuestionEvaluationResult {
  questionId: string;
  sectionId?: string | null;
  sectionTitle?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  selectedOptionKey: string | null;
  correctOptionKey: string;
  isAttempted: boolean;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpentSeconds: number;
  markedForReview: boolean;
}

export interface SectionBreakdown {
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

export interface ScoringSummary {
  totalQuestions: number;
  totalMarks: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  positiveScore: number;
  negativeScore: number;
  finalScore: number;
  accuracy: number;     // e.g. 83.33%
  percentage: number;   // e.g. 64.25%
  isPassed: boolean;
  questionResults: QuestionEvaluationResult[];
  sectionBreakdowns: SectionBreakdown[];
}

export function evaluateTestAttempt(
  questions: QuestionToEvaluate[],
  answers: UserSubmittedAnswer[],
  testConfig: {
    totalMarks?: number;
    passPercentage?: number;
    isNegativeMarking?: boolean;
  }
): ScoringSummary {
  const answerMap = new Map<string, UserSubmittedAnswer>();
  for (const ans of answers) {
    if (ans.questionId) {
      answerMap.set(ans.questionId, ans);
    }
  }

  let totalQuestions = questions.length;
  let computedTotalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let positiveScore = 0;
  let negativeScore = 0;

  const isNegativeMarking = testConfig.isNegativeMarking !== false;
  const questionResults: QuestionEvaluationResult[] = [];
  const sectionMap = new Map<string, SectionBreakdown>();

  for (const q of questions) {
    computedTotalMarks += q.marks;
    const userAns = answerMap.get(q.questionId);
    const selectedKey = userAns?.selectedOptionKey?.trim().toUpperCase() || null;
    const isAttempted = Boolean(selectedKey);
    const correctKey = q.correctOptionKey.trim().toUpperCase();

    let isCorrect = false;
    let marksAwarded = 0;

    if (isAttempted && selectedKey) {
      if (selectedKey === correctKey) {
        isCorrect = true;
        marksAwarded = q.marks;
        correctCount++;
        positiveScore += q.marks;
      } else {
        isCorrect = false;
        const penalty = isNegativeMarking ? Math.abs(q.negativeMarks) : 0;
        marksAwarded = -penalty;
        incorrectCount++;
        negativeScore += penalty;
      }
    } else {
      unattemptedCount++;
      marksAwarded = 0;
    }

    const evalResult: QuestionEvaluationResult = {
      questionId: q.questionId,
      sectionId: q.sectionId ?? null,
      sectionTitle: q.sectionTitle ?? "General",
      subjectId: q.subjectId ?? null,
      subjectName: q.subjectName ?? "General",
      selectedOptionKey: selectedKey,
      correctOptionKey: correctKey,
      isAttempted,
      isCorrect,
      marksAwarded: round2(marksAwarded),
      timeSpentSeconds: userAns?.timeSpentSeconds ?? 0,
      markedForReview: Boolean(userAns?.markedForReview),
    };
    questionResults.push(evalResult);

    // Section Breakdown Accumulation
    const secKey = q.sectionId || "default";
    const secTitle = q.sectionTitle || "General Section";

    if (!sectionMap.has(secKey)) {
      sectionMap.set(secKey, {
        sectionId: secKey,
        title: secTitle,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        positiveMarks: 0,
        negativeMarks: 0,
        score: 0,
        accuracy: 0,
      });
    }

    const sec = sectionMap.get(secKey)!;
    sec.totalQuestions++;
    if (isAttempted) {
      sec.attempted++;
      if (isCorrect) {
        sec.correct++;
        sec.positiveMarks += q.marks;
      } else {
        sec.incorrect++;
        sec.negativeMarks += isNegativeMarking ? Math.abs(q.negativeMarks) : 0;
      }
    } else {
      sec.unattempted++;
    }
  }

  // Calculate final section scores & accuracies
  const sectionBreakdowns: SectionBreakdown[] = [];
  for (const sec of sectionMap.values()) {
    sec.score = round2(sec.positiveMarks - sec.negativeMarks);
    sec.positiveMarks = round2(sec.positiveMarks);
    sec.negativeMarks = round2(sec.negativeMarks);
    sec.accuracy =
      sec.attempted > 0
        ? round2((sec.correct / sec.attempted) * 100)
        : 0;
    sectionBreakdowns.push(sec);
  }

  const finalMarksTotal = testConfig.totalMarks || (computedTotalMarks > 0 ? computedTotalMarks : 100);
  const rawFinalScore = positiveScore - negativeScore;
  const finalScore = round2(rawFinalScore);
  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? round2((correctCount / attemptedCount) * 100) : 0;
  const percentage = finalMarksTotal > 0 ? round2((finalScore / finalMarksTotal) * 100) : 0;
  const passPercentage = testConfig.passPercentage ?? 40;
  const isPassed = percentage >= passPercentage;

  return {
    totalQuestions,
    totalMarks: round2(finalMarksTotal),
    attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    positiveScore: round2(positiveScore),
    negativeScore: round2(negativeScore),
    finalScore,
    accuracy,
    percentage,
    isPassed,
    questionResults,
    sectionBreakdowns,
  };
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
