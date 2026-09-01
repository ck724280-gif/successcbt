import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { SaveAnswerSchema } from "@/lib/validation/schemas";
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

    const body = await req.json();
    const parsed = SaveAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid answer payload", 400, parsed.error.format());
    }

    const {
      questionId,
      sectionId,
      selectedOptionKey,
      markedForReview,
      isVisited,
      timeSpentSeconds,
      currentQuestionIndex,
    } = parsed.data;

    // Verify attempt ownership and active status
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!attempt) {
      return errorResponse("Attempt not found", 404);
    }

    if (attempt.userId !== session.user.id) {
      return errorResponse("Forbidden", 403);
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return errorResponse(`Cannot save answer: Test is already ${attempt.status.toLowerCase()}`, 400);
    }

    // Determine isAnswered boolean
    const hasSelection = Boolean(selectedOptionKey && selectedOptionKey.trim().length > 0);

    // Upsert the answer record efficiently
    await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        sectionId: sectionId || undefined,
        selectedOptionKey: hasSelection ? selectedOptionKey?.toUpperCase() : null,
        isAnswered: hasSelection,
        markedForReview: markedForReview ?? false,
        isVisited: isVisited ?? true,
        timeSpentSeconds: timeSpentSeconds ?? undefined,
      },
      create: {
        attemptId,
        questionId,
        sectionId: sectionId || null,
        selectedOptionKey: hasSelection ? selectedOptionKey?.toUpperCase() : null,
        isAnswered: hasSelection,
        markedForReview: markedForReview ?? false,
        isVisited: isVisited ?? true,
        timeSpentSeconds: timeSpentSeconds ?? 0,
      },
    });

    // Update current index in attempt if provided
    if (typeof currentQuestionIndex === "number") {
      await prisma.attempt.update({
        where: { id: attemptId },
        data: {
          currentQuestionIndex,
          ...(sectionId ? { currentSectionId: sectionId } : {}),
        },
      });
    }

    return successResponse({ saved: true }, "Answer state saved");
  } catch (error: any) {
    console.error("Save Answer Error:", error);
    return errorResponse("Failed to save answer", 500);
  }
}
