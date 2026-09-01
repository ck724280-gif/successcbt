import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { AttemptStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = params;

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        test: {
          include: {
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
                      select: {
                        id: true,
                        optionKey: true,
                        contentEn: true,
                        contentHi: true,
                        orderIndex: true,
                        // DO NOT select `isCorrect` - Security
                      },
                    },
                    subject: {
                      select: { id: true, name: true, code: true },
                    },
                    topic: {
                      select: { id: true, name: true },
                    },
                  },
                },
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

    if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: You do not own this test attempt.", 403);
    }

    const now = new Date();
    const expiresAt = new Date(attempt.expiresAt);
    const isExpired = now.getTime() >= expiresAt.getTime();

    // Calculate remaining seconds
    const timeRemainingSeconds = isExpired
      ? 0
      : Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    // Construct sanitized question list
    const questions = attempt.test.testQuestions.map((tq, index) => {
      const q = tq.question;
      return {
        questionIndex: index,
        questionId: q.id,
        testQuestionId: tq.id,
        sectionId: tq.sectionId,
        marks: tq.marks,
        negativeMarks: tq.negativeMarks,
        subjectId: q.subjectId,
        subjectName: q.subject.name,
        topicName: q.topic?.name || null,
        difficulty: q.difficulty,
        type: q.type,
        questionEn: q.questionEn,
        questionHi: q.questionHi,
        // DO NOT include explanationEn / explanationHi
        options: q.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          contentEn: opt.contentEn,
          contentHi: opt.contentHi,
          orderIndex: opt.orderIndex,
        })),
      };
    });

    // Create a dictionary of existing answers for fast client lookup
    const savedAnswersMap: Record<string, {
      selectedOptionKey: string | null;
      markedForReview: boolean;
      isVisited: boolean;
      isAnswered: boolean;
      timeSpentSeconds: number;
    }> = {};

    for (const ans of attempt.answers) {
      savedAnswersMap[ans.questionId] = {
        selectedOptionKey: ans.selectedOptionKey,
        markedForReview: ans.markedForReview,
        isVisited: ans.isVisited,
        isAnswered: ans.isAnswered,
        timeSpentSeconds: ans.timeSpentSeconds,
      };
    }

    return successResponse({
      attempt: {
        id: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        instructions: attempt.test.instructions,
        durationMinutes: attempt.test.durationMinutes,
        totalMarks: attempt.test.totalMarks,
        isNegativeMarking: attempt.test.isNegativeMarking,
        status: attempt.status,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        timeRemainingSeconds,
        currentQuestionIndex: attempt.currentQuestionIndex,
        currentSectionId: attempt.currentSectionId,
        isExpired,
      },
      sections: attempt.test.sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        orderIndex: sec.orderIndex,
        positiveMarks: sec.positiveMarks,
        negativeMarks: sec.negativeMarks,
        instructions: sec.instructions,
      })),
      questions,
      savedAnswers: savedAnswersMap,
    }, "Attempt environment loaded successfully");
  } catch (error: any) {
    console.error("Get Attempt Error:", error);
    return errorResponse("Failed to load test attempt", 500);
  }
}
