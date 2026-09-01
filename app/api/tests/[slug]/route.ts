import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const test = await prisma.test.findUnique({
      where: { slug },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: { select: { name: true, slug: true } },
          },
        },
        sections: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            positiveMarks: true,
            negativeMarks: true,
            totalQuestions: true,
            instructions: true,
            _count: { select: { testQuestions: true } },
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
    });

    if (!test || !test.isPublished) {
      return errorResponse("Test not found or is not currently active.", 404);
    }

    return successResponse(test, "Test instructions retrieved");
  } catch (error: any) {
    console.error("Fetch Test by Slug Error:", error);
    return errorResponse("Failed to fetch test details", 500);
  }
}
