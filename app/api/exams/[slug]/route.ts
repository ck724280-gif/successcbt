import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const exam = await prisma.exam.findUnique({
      where: { slug },
      include: {
        category: true,
        tests: {
          where: { isPublished: true },
          include: {
            _count: {
              select: {
                testQuestions: true,
                attempts: { where: { status: "SUBMITTED" } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!exam) {
      return errorResponse("Exam not found", 404);
    }

    return successResponse(exam, "Exam details retrieved");
  } catch (error: any) {
    console.error("Fetch Exam by Slug Error:", error);
    return errorResponse("Failed to retrieve exam details", 500);
  }
}
