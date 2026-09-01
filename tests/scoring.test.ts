import { describe, it, expect } from "vitest";
import { evaluateTestAttempt, QuestionToEvaluate, UserSubmittedAnswer } from "@/lib/scoring/scoringEngine";

describe("CBT Platform Scoring Engine Unit Tests", () => {
  const sampleQuestions: QuestionToEvaluate[] = [
    {
      questionId: "q1",
      sectionId: "sec1",
      sectionTitle: "Reasoning",
      marks: 2.0,
      negativeMarks: 0.5,
      correctOptionKey: "B",
    },
    {
      questionId: "q2",
      sectionId: "sec1",
      sectionTitle: "Reasoning",
      marks: 2.0,
      negativeMarks: 0.5,
      correctOptionKey: "C",
    },
    {
      questionId: "q3",
      sectionId: "sec2",
      sectionTitle: "Quantitative Aptitude",
      marks: 2.0,
      negativeMarks: 0.5,
      correctOptionKey: "A",
    },
    {
      questionId: "q4",
      sectionId: "sec2",
      sectionTitle: "Quantitative Aptitude",
      marks: 2.0,
      negativeMarks: 0.5,
      correctOptionKey: "D",
    },
  ];

  it("should calculate 100% score when all questions are answered correctly", () => {
    const answers: UserSubmittedAnswer[] = [
      { questionId: "q1", selectedOptionKey: "B" },
      { questionId: "q2", selectedOptionKey: "C" },
      { questionId: "q3", selectedOptionKey: "A" },
      { questionId: "q4", selectedOptionKey: "D" },
    ];

    const result = evaluateTestAttempt(sampleQuestions, answers, {
      totalMarks: 8.0,
      passPercentage: 50.0,
      isNegativeMarking: true,
    });

    expect(result.totalQuestions).toBe(4);
    expect(result.correctCount).toBe(4);
    expect(result.incorrectCount).toBe(0);
    expect(result.unattemptedCount).toBe(0);
    expect(result.positiveScore).toBe(8.0);
    expect(result.negativeScore).toBe(0.0);
    expect(result.finalScore).toBe(8.0);
    expect(result.accuracy).toBe(100.0);
    expect(result.percentage).toBe(100.0);
    expect(result.isPassed).toBe(true);
  });

  it("should apply negative marking correctly for incorrect answers", () => {
    // 2 Correct (+4.0), 1 Incorrect (-0.5), 1 Unattempted (0)
    const answers: UserSubmittedAnswer[] = [
      { questionId: "q1", selectedOptionKey: "B" }, // Correct
      { questionId: "q2", selectedOptionKey: "A" }, // Incorrect (Correct is C)
      { questionId: "q3", selectedOptionKey: "A" }, // Correct
      // q4 unattempted
    ];

    const result = evaluateTestAttempt(sampleQuestions, answers, {
      totalMarks: 8.0,
      passPercentage: 40.0,
      isNegativeMarking: true,
    });

    expect(result.correctCount).toBe(2);
    expect(result.incorrectCount).toBe(1);
    expect(result.unattemptedCount).toBe(1);
    expect(result.positiveScore).toBe(4.0);
    expect(result.negativeScore).toBe(0.5);
    expect(result.finalScore).toBe(3.5); // 4.0 - 0.5
    expect(result.accuracy).toBe(66.67); // 2 out of 3 attempted
    expect(result.percentage).toBe(43.75); // 3.5 / 8.0 * 100
    expect(result.isPassed).toBe(true);
  });

  it("should ignore negative deduction when negative marking is disabled", () => {
    const answers: UserSubmittedAnswer[] = [
      { questionId: "q1", selectedOptionKey: "B" }, // Correct (+2.0)
      { questionId: "q2", selectedOptionKey: "A" }, // Incorrect (0 penalty)
      { questionId: "q3", selectedOptionKey: "C" }, // Incorrect (0 penalty)
      { questionId: "q4", selectedOptionKey: "D" }, // Correct (+2.0)
    ];

    const result = evaluateTestAttempt(sampleQuestions, answers, {
      totalMarks: 8.0,
      passPercentage: 50.0,
      isNegativeMarking: false,
    });

    expect(result.positiveScore).toBe(4.0);
    expect(result.negativeScore).toBe(0.0);
    expect(result.finalScore).toBe(4.0);
    expect(result.accuracy).toBe(50.0);
  });

  it("should compute section breakdowns accurately", () => {
    const answers: UserSubmittedAnswer[] = [
      { questionId: "q1", selectedOptionKey: "B" }, // sec1 Correct
      { questionId: "q2", selectedOptionKey: "C" }, // sec1 Correct
      { questionId: "q3", selectedOptionKey: "B" }, // sec2 Incorrect
      // q4 sec2 unattempted
    ];

    const result = evaluateTestAttempt(sampleQuestions, answers, {
      totalMarks: 8.0,
      isNegativeMarking: true,
    });

    expect(result.sectionBreakdowns.length).toBe(2);

    const sec1 = result.sectionBreakdowns.find((s) => s.sectionId === "sec1")!;
    expect(sec1.totalQuestions).toBe(2);
    expect(sec1.correct).toBe(2);
    expect(sec1.score).toBe(4.0);
    expect(sec1.accuracy).toBe(100.0);

    const sec2 = result.sectionBreakdowns.find((s) => s.sectionId === "sec2")!;
    expect(sec2.totalQuestions).toBe(2);
    expect(sec2.correct).toBe(0);
    expect(sec2.incorrect).toBe(1);
    expect(sec2.unattempted).toBe(1);
    expect(sec2.score).toBe(-0.5);
    expect(sec2.accuracy).toBe(0.0);
  });

  it("should handle 0 questions attempted safely without divide-by-zero", () => {
    const answers: UserSubmittedAnswer[] = [];

    const result = evaluateTestAttempt(sampleQuestions, answers, {
      totalMarks: 8.0,
      passPercentage: 40.0,
    });

    expect(result.attemptedCount).toBe(0);
    expect(result.unattemptedCount).toBe(4);
    expect(result.finalScore).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.isPassed).toBe(false);
  });
});
