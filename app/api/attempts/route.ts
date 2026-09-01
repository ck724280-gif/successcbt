import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { StartAttemptSchema } from "@/lib/validation/schemas";
import { AttemptStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse("Please login to start this test.", 401);
    }

    const body = await req.json();
    const parsed = StartAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid request payload", 400, parsed.error.format());
    }

    const { testId } = parsed.data;

    // Verify test exists and is published
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!test || !test.isPublished) {
      return errorResponse("Test not found or is currently unavailable.", 404);
    }

    if (test.testQuestions.length === 0) {
      return errorResponse("This test does not have any questions yet.", 400);
    }

    const now = new Date();

    // Check if user already has an active (IN_PROGRESS) attempt for this test
    const existingActiveAttempt = await prisma.attempt.findFirst({
      where: {
        userId: session.user.id,
        testId: test.id,
        status: AttemptStatus.IN_PROGRESS,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingActiveAttempt) {
      // Check if existing attempt has expired
      if (new Date(existingActiveAttempt.expiresAt).getTime() <= now.getTime()) {
        // Mark as expired
        await prisma.attempt.update({
          where: { id: existingActiveAttempt.id },
          data: { status: AttemptStatus.EXPIRED },
        });
      } else {
        // Resume existing active attempt
        return successResponse(
          {
            attemptId: existingActiveAttempt.id,
            isResumed: true,
            expiresAt: existingActiveAttempt.expiresAt,
            timeRemainingSeconds: Math.max(
              0,
              Math.floor((new Date(existingActiveAttempt.expiresAt).getTime() - now.getTime()) / 1000)
            ),
          },
          "Resumed active attempt"
        );
      }
    }

    // Create new attempt
    const expiresAt = new Date(now.getTime() + test.durationMinutes * 60 * 1000);

    const newAttempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        testId: test.id,
        status: AttemptStatus.IN_PROGRESS,
        startedAt: now,
        expiresAt: expiresAt,
        totalMarks: test.totalMarks,
        unattemptedCount: test.testQuestions.length,
        answers: {
          create: test.testQuestions.map((tq, idx) => ({
            questionId: tq.questionId,
            sectionId: tq.sectionId,
            isVisited: idx === 0, // First question is visited by default
            isAnswered: false,
            markedForReview: false,
            timeSpentSeconds: 0,
          })),
        },
      },
    });

    return successResponse(
      {
        attemptId: newAttempt.id,
        isResumed: false,
        expiresAt: newAttempt.expiresAt,
        timeRemainingSeconds: test.durationMinutes * 60,
      },
      "Test attempt started successfully",
      201
    );
  } catch (error: any) {
    console.error("Start Attempt Error:", error);
    return errorResponse("Failed to start test attempt", 500);
  }
}
