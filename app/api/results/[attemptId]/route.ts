import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { round2 } from "@/lib/scoring/scoringEngine";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { attemptId } = params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        test: {
          include: {
            exam: {
              select: { title: true, slug: true },
            },
            sections: {
              orderBy: { orderIndex: "asc" },
            },
            testQuestions: {
              orderBy: { orderIndex: "asc" },
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { orderIndex: "asc" },
                    },
                    subject: true,
                    topic: true,
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
      return errorResponse("Test attempt not found", 404);
    }

    // Candidate or Admin can view result
    if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: You do not have access to this test result", 403);
    }

    // Build answer map
    const answerMap = new Map();
    for (const ans of attempt.answers) {
      answerMap.set(ans.questionId, ans);
    }

    // Build question-level detailed solutions
    const questionSolutions = attempt.test.testQuestions.map((tq, index) => {
      const q = tq.question;
      const userAns = answerMap.get(q.id);
      const correctOpt = q.options.find((o) => o.isCorrect);

      const selectedOptionKey = userAns?.selectedOptionKey || null;
      const correctOptionKey = correctOpt?.optionKey || "A";
      const isAttempted = Boolean(selectedOptionKey);
      const isCorrect = isAttempted && selectedOptionKey === correctOptionKey;

      let status = "UNATTEMPTED";
      if (isAttempted) {
        status = isCorrect ? "CORRECT" : "INCORRECT";
      }

      return {
        questionIndex: index,
        questionId: q.id,
        sectionId: tq.sectionId,
        sectionTitle: tq.section?.title || "General",
        subjectName: q.subject.name,
        topicName: q.topic?.name || null,
        difficulty: q.difficulty,
        questionEn: q.questionEn,
        questionHi: q.questionHi,
        explanationEn: q.explanationEn,
        explanationHi: q.explanationHi,
        marks: tq.marks,
        negativeMarks: tq.negativeMarks,
        marksAwarded: userAns?.marksAwarded ?? 0,
        timeSpentSeconds: userAns?.timeSpentSeconds ?? 0,
        selectedOptionKey,
        correctOptionKey,
        isAttempted,
        isCorrect,
        status,
        markedForReview: userAns?.markedForReview ?? false,
        options: q.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          contentEn: opt.contentEn,
          contentHi: opt.contentHi,
          isCorrect: opt.isCorrect,
        })),
      };
    });

    // Compute Section-wise aggregates
    const sectionMap = new Map();
    for (const qs of questionSolutions) {
      const sId = qs.sectionId || "default";
      if (!sectionMap.has(sId)) {
        sectionMap.set(sId, {
          sectionId: sId,
          title: qs.sectionTitle,
          totalQuestions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          positiveMarks: 0,
          negativeMarks: 0,
          score: 0,
          accuracy: 0,
          totalTimeSeconds: 0,
        });
      }
      const s = sectionMap.get(sId);
      s.totalQuestions++;
      s.totalTimeSeconds += qs.timeSpentSeconds;
      if (qs.isAttempted) {
        s.attempted++;
        if (qs.isCorrect) {
          s.correct++;
          s.positiveMarks += qs.marks;
        } else {
          s.incorrect++;
          s.negativeMarks += qs.negativeMarks;
        }
      } else {
        s.unattempted++;
      }
    }

    const sectionBreakdowns = Array.from(sectionMap.values()).map((s) => ({
      ...s,
      score: round2(s.positiveMarks - s.negativeMarks),
      positiveMarks: round2(s.positiveMarks),
      negativeMarks: round2(s.negativeMarks),
      accuracy: s.attempted > 0 ? round2((s.correct / s.attempted) * 100) : 0,
    }));

    // Total attempts on this test for calculating percentile
    const totalSubmittedAttempts = await prisma.attempt.count({
      where: { testId: attempt.testId, status: "SUBMITTED" },
    });

    const rank = attempt.rank || 1;
    const percentile =
      totalSubmittedAttempts > 1
        ? round2(((totalSubmittedAttempts - rank) / totalSubmittedAttempts) * 100)
        : 100;

    const isPassed = attempt.percentage >= attempt.test.passPercentage;

    return successResponse({
      attemptId: attempt.id,
      candidate: {
        id: attempt.user.id,
        name: attempt.user.name,
        email: attempt.user.email,
      },
      test: {
        id: attempt.test.id,
        title: attempt.test.title,
        examTitle: attempt.test.exam.title,
        durationMinutes: attempt.test.durationMinutes,
        totalMarks: attempt.test.totalMarks,
        passPercentage: attempt.test.passPercentage,
        isNegativeMarking: attempt.test.isNegativeMarking,
      },
      summary: {
        status: attempt.status,
        score: attempt.score,
        positiveScore: attempt.positiveScore,
        negativeScore: attempt.negativeScore,
        totalMarks: attempt.test.totalMarks,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unattemptedCount: attempt.unattemptedCount,
        totalQuestions: questionSolutions.length,
        accuracy: attempt.accuracy,
        percentage: attempt.percentage,
        timeSpentSeconds: attempt.timeSpentSeconds,
        rank,
        percentile,
        totalCandidates: totalSubmittedAttempts,
        isPassed,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      sectionBreakdowns,
      questions: questionSolutions,
    }, "Result details loaded");
  } catch (error: any) {
    console.error("Get Result Error:", error);
    return errorResponse("Failed to load result analysis", 500);
  }
}
