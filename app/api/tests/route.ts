import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examSlug = searchParams.get("exam");
    const isFree = searchParams.get("free");

    const tests = await prisma.test.findMany({
      where: {
        isPublished: true,
        ...(examSlug ? { exam: { slug: examSlug } } : {}),
        ...(isFree !== null && isFree !== undefined ? { isFree: isFree === "true" } : {}),
      },
      include: {
        exam: {
          select: {
            title: true,
            slug: true,
            category: { select: { name: true } },
          },
        },
        sections: {
          select: {
            id: true,
            title: true,
            totalQuestions: true,
          },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            testQuestions: true,
            attempts: { where: { status: "SUBMITTED" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(tests, "Tests retrieved successfully");
  } catch (error: any) {
    console.error("Fetch Tests Error:", error);
    return errorResponse("Failed to fetch tests", 500);
  }
}
