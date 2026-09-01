import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { TestCreateSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const examId = searchParams.get("examId");

    const tests = await prisma.test.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { slug: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          examId ? { examId } : {},
        ],
      },
      include: {
        exam: {
          select: { id: true, title: true, slug: true },
        },
        sections: {
          select: { id: true, title: true, orderIndex: true, totalQuestions: true },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            testQuestions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(tests, "Admin tests list retrieved");
  } catch (error: any) {
    console.error("Admin Tests GET Error:", error);
    return errorResponse("Failed to fetch tests", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const body = await req.json();
    const parsed = TestCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.format());
    }

    const {
      examId,
      title,
      slug,
      description,
      instructions,
      durationMinutes,
      totalMarks,
      passPercentage,
      positiveMarksPerQ,
      negativeMarksPerQ,
      isNegativeMarking,
      isPublished,
      isFree,
      randomQuestionOrder,
      randomOptionOrder,
      sections,
    } = parsed.data;

    // Check slug uniqueness
    const existingTest = await prisma.test.findUnique({
      where: { slug },
    });
    if (existingTest) {
      return errorResponse("A test with this slug already exists. Please choose a unique slug.", 400);
    }

    const newTest = await prisma.$transaction(async (tx) => {
      const test = await tx.test.create({
        data: {
          examId,
          title,
          slug,
          description,
          instructions,
          durationMinutes,
          totalMarks,
          passPercentage,
          positiveMarksPerQ,
          negativeMarksPerQ,
          isNegativeMarking,
          isPublished,
          isFree,
          randomQuestionOrder,
          randomOptionOrder,
        },
      });

      if (sections && sections.length > 0) {
        let globalQOrder = 0;
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const createdSection = await tx.testSection.create({
            data: {
              testId: test.id,
              title: sec.title,
              orderIndex: sec.orderIndex ?? i,
              positiveMarks: sec.positiveMarks ?? positiveMarksPerQ,
              negativeMarks: sec.negativeMarks ?? negativeMarksPerQ,
              totalQuestions: sec.questionIds.length,
              instructions: sec.instructions,
            },
          });

          for (const qId of sec.questionIds) {
            await tx.testQuestion.create({
              data: {
                testId: test.id,
                sectionId: createdSection.id,
                questionId: qId,
                orderIndex: globalQOrder++,
                marks: sec.positiveMarks ?? positiveMarksPerQ,
                negativeMarks: sec.negativeMarks ?? negativeMarksPerQ,
              },
            });
          }
        }
      }

      return test;
    });

    return successResponse(newTest, "Test created successfully", 201);
  } catch (error: any) {
    console.error("Admin Test POST Error:", error);
    return errorResponse("Failed to create test", 500);
  }
}
