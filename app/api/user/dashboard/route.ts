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
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const userId = session.user.id;

    // Fetch user's attempts
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            slug: true,
            totalMarks: true,
            passPercentage: true,
            exam: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const submittedAttempts = attempts.filter((a) => a.status === "SUBMITTED");

    const totalAttempts = submittedAttempts.length;
    let totalScore = 0;
    let totalAccuracy = 0;
    let passedCount = 0;

    for (const att of submittedAttempts) {
      totalScore += att.score;
      totalAccuracy += att.accuracy;
      if (att.percentage >= att.test.passPercentage) {
        passedCount++;
      }
    }

    const avgScore = totalAttempts > 0 ? round2(totalScore / totalAttempts) : 0;
    const avgAccuracy = totalAttempts > 0 ? round2(totalAccuracy / totalAttempts) : 0;
    const passRate = totalAttempts > 0 ? round2((passedCount / totalAttempts) * 100) : 0;

    // Chart performance trend (last 10 submitted attempts in chronological order)
    const performanceTrend = [...submittedAttempts]
      .reverse()
      .slice(-10)
      .map((att, idx) => ({
        testName: att.test.title.length > 20 ? att.test.title.substring(0, 18) + "..." : att.test.title,
        score: att.score,
        accuracy: att.accuracy,
        percentage: att.percentage,
        date: new Date(att.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));

    return successResponse({
      stats: {
        totalAttempts,
        avgScore,
        avgAccuracy,
        passedCount,
        passRate,
      },
      recentAttempts: attempts.slice(0, 8).map((att) => ({
        id: att.id,
        testId: att.test.id,
        testTitle: att.test.title,
        testSlug: att.test.slug,
        examTitle: att.test.exam.title,
        status: att.status,
        score: att.score,
        totalMarks: att.test.totalMarks,
        accuracy: att.accuracy,
        percentage: att.percentage,
        rank: att.rank,
        isPassed: att.percentage >= att.test.passPercentage,
        createdAt: att.createdAt,
      })),
      performanceTrend,
    }, "Dashboard data loaded");
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return errorResponse("Failed to load dashboard data", 500);
  }
}
