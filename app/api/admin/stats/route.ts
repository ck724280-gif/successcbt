import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { round2 } from "@/lib/scoring/scoringEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const [
      totalUsers,
      totalTests,
      totalQuestions,
      totalAttempts,
      submittedAttempts,
      activeTestsCount,
      recentAttempts,
      popularTests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.test.count(),
      prisma.question.count(),
      prisma.attempt.count(),
      prisma.attempt.findMany({
        where: { status: "SUBMITTED" },
        select: { score: true, accuracy: true, percentage: true },
      }),
      prisma.test.count({ where: { isPublished: true } }),
      prisma.attempt.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          test: { select: { title: true, totalMarks: true } },
        },
      }),
      prisma.test.findMany({
        take: 5,
        orderBy: { attempts: { _count: "desc" } },
        include: {
          exam: { select: { title: true } },
          _count: { select: { attempts: true, testQuestions: true } },
        },
      }),
    ]);

    const avgScore =
      submittedAttempts.length > 0
        ? round2(
            submittedAttempts.reduce((acc, curr) => acc + curr.score, 0) /
              submittedAttempts.length
          )
        : 0;

    const avgAccuracy =
      submittedAttempts.length > 0
        ? round2(
            submittedAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) /
              submittedAttempts.length
          )
        : 0;

    return successResponse({
      metrics: {
        totalUsers,
        totalTests,
        totalQuestions,
        totalAttempts,
        activeTestsCount,
        submittedCount: submittedAttempts.length,
        avgScore,
        avgAccuracy,
      },
      recentAttempts: recentAttempts.map((att) => ({
        id: att.id,
        userName: att.user.name,
        userEmail: att.user.email,
        testTitle: att.test.title,
        status: att.status,
        score: att.score,
        totalMarks: att.test.totalMarks,
        accuracy: att.accuracy,
        createdAt: att.createdAt,
      })),
      popularTests: popularTests.map((t) => ({
        id: t.id,
        title: t.title,
        examTitle: t.exam.title,
        totalQuestions: t._count.testQuestions,
        attemptsCount: t._count.attempts,
        isPublished: t.isPublished,
      })),
    }, "Admin statistics loaded");
  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return errorResponse("Failed to load admin analytics", 500);
  }
}
