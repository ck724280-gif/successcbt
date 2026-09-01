import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { evaluateTestAttempt, QuestionToEvaluate, UserSubmittedAnswer } from "@/lib/scoring/scoringEngine";
import { AttemptStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { id: attemptId } = params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            sections: true,
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: true,
                    subject: true,
                  },
                },
                section: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return errorResponse("Attempt not found", 404);
    }

    if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    // Idempotent: If already submitted, return the existing result
    if (attempt.status === AttemptStatus.SUBMITTED) {
      return successResponse(
        {
          attemptId: attempt.id,
          alreadySubmitted: true,
          score: attempt.score,
          accuracy: attempt.accuracy,
          percentage: attempt.percentage,
          correctCount: attempt.correctCount,
          incorrectCount: attempt.incorrectCount,
          unattemptedCount: attempt.unattemptedCount,
          resultUrl: `/result/${attempt.id}`,
        },
        "Test was already submitted"
      );
    }

    // Optional payload with final answer batch or time spent
    let requestAnswers: any[] = [];
    let timeSpentSeconds = 0;
    try {
      const body = await req.json();
      if (body.answers && Array.isArray(body.answers)) {
        requestAnswers = body.answers;
      }
      if (typeof body.timeSpentSeconds === "number") {
        timeSpentSeconds = body.timeSpentSeconds;
      }
    } catch (e) {
      // Body might be empty, which is completely fine
    }

    // Build the questions to evaluate from official DB state
    const questionsToEvaluate: QuestionToEvaluate[] = attempt.test.testQuestions.map((tq) => {
      const correctOpt = tq.question.options.find((o) => o.isCorrect);
      return {
        questionId: tq.questionId,
        sectionId: tq.sectionId,
        sectionTitle: tq.section?.title || "General",
        subjectId: tq.question.subjectId,
        subjectName: tq.question.subject?.name || "General",
        marks: tq.marks,
        negativeMarks: tq.negativeMarks,
        correctOptionKey: correctOpt?.optionKey || "A",
      };
    });

    // Merge database answers with any final submitted batch answers
    const answersMap = new Map<string, UserSubmittedAnswer>();
    for (const dbAns of attempt.answers) {
      answersMap.set(dbAns.questionId, {
        questionId: dbAns.questionId,
        selectedOptionKey: dbAns.selectedOptionKey,
        markedForReview: dbAns.markedForReview,
        timeSpentSeconds: dbAns.timeSpentSeconds,
      });
    }

    for (const incoming of requestAnswers) {
      if (incoming.questionId) {
        const existing = answersMap.get(incoming.questionId);
        answersMap.set(incoming.questionId, {
          questionId: incoming.questionId,
          selectedOptionKey:
            incoming.selectedOptionKey !== undefined
              ? incoming.selectedOptionKey
              : existing?.selectedOptionKey,
          markedForReview:
            incoming.markedForReview !== undefined
              ? incoming.markedForReview
              : existing?.markedForReview,
          timeSpentSeconds:
            incoming.timeSpentSeconds !== undefined
              ? incoming.timeSpentSeconds
              : existing?.timeSpentSeconds,
        });
      }
    }

    const compiledAnswers = Array.from(answersMap.values());

    // Execute scoring engine
    const evaluation = evaluateTestAttempt(questionsToEvaluate, compiledAnswers, {
      totalMarks: attempt.test.totalMarks,
      passPercentage: attempt.test.passPercentage,
      isNegativeMarking: attempt.test.isNegativeMarking,
    });

    const now = new Date();

    // Calculate total time spent if not provided
    const totalTimeSpent =
      timeSpentSeconds > 0
        ? timeSpentSeconds
        : Math.min(
            attempt.test.durationMinutes * 60,
            Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
          );

    // Run transaction to persist scored state
    await prisma.$transaction(async (tx) => {
      // 1. Update each answer record with correctness & marks
      for (const qr of evaluation.questionResults) {
        await tx.attemptAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: qr.questionId,
            },
          },
          update: {
            sectionId: qr.sectionId,
            selectedOptionKey: qr.selectedOptionKey,
            isAnswered: qr.isAttempted,
            isCorrect: qr.isCorrect,
            marksAwarded: qr.marksAwarded,
            markedForReview: qr.markedForReview,
            timeSpentSeconds: qr.timeSpentSeconds,
          },
          create: {
            attemptId,
            questionId: qr.questionId,
            sectionId: qr.sectionId,
            selectedOptionKey: qr.selectedOptionKey,
            isAnswered: qr.isAttempted,
            isCorrect: qr.isCorrect,
            marksAwarded: qr.marksAwarded,
            markedForReview: qr.markedForReview,
            timeSpentSeconds: qr.timeSpentSeconds,
          },
        });
      }

      // 2. Update Attempt
      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.SUBMITTED,
          submittedAt: now,
          timeSpentSeconds: totalTimeSpent,
          score: evaluation.finalScore,
          positiveScore: evaluation.positiveScore,
          negativeScore: evaluation.negativeScore,
          correctCount: evaluation.correctCount,
          incorrectCount: evaluation.incorrectCount,
          unattemptedCount: evaluation.unattemptedCount,
          accuracy: evaluation.accuracy,
          percentage: evaluation.percentage,
        },
      });
    });

    // Compute dynamic candidate rank among all submitted attempts of this test
    const higherScoresCount = await prisma.attempt.count({
      where: {
        testId: attempt.testId,
        status: AttemptStatus.SUBMITTED,
        score: { gt: evaluation.finalScore },
      },
    });
    const rank = higherScoresCount + 1;

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { rank },
    });

    return successResponse(
      {
        attemptId: attempt.id,
        score: evaluation.finalScore,
        totalMarks: evaluation.totalMarks,
        correctCount: evaluation.correctCount,
        incorrectCount: evaluation.incorrectCount,
        unattemptedCount: evaluation.unattemptedCount,
        accuracy: evaluation.accuracy,
        percentage: evaluation.percentage,
        isPassed: evaluation.isPassed,
        rank,
        resultUrl: `/result/${attempt.id}`,
      },
      "Test submitted and evaluated successfully"
    );
  } catch (error: any) {
    console.error("Submit Attempt Error:", error);
    return errorResponse("Failed to submit and evaluate test", 500);
  }
}
