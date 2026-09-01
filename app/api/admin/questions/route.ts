import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { QuestionCreateSchema } from "@/lib/validation/schemas";
import { Difficulty, QuestionType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const subjectId = searchParams.get("subjectId");
    const difficulty = searchParams.get("difficulty") as Difficulty | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        search
          ? {
              OR: [
                { questionEn: { contains: search, mode: "insensitive" } },
                { questionHi: { contains: search, mode: "insensitive" } },
                { explanationEn: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        subjectId ? { subjectId } : {},
        difficulty ? { difficulty } : {},
      ],
    };

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: { select: { id: true, name: true, code: true } },
          topic: { select: { id: true, name: true } },
          options: { orderBy: { orderIndex: "asc" } },
          _count: { select: { testQuestions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return successResponse({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, "Questions retrieved successfully");
  } catch (error: any) {
    console.error("Admin Questions GET Error:", error);
    return errorResponse("Failed to fetch question bank", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const body = await req.json();
    const parsed = QuestionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.format());
    }

    const {
      subjectId,
      topicId,
      questionEn,
      questionHi,
      explanationEn,
      explanationHi,
      difficulty,
      type,
      defaultMarks,
      defaultNegativeMarks,
      options,
    } = parsed.data;

    // Verify at least one correct option
    const hasCorrect = options.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      return errorResponse("At least one option must be marked as correct.", 400);
    }

    const newQuestion = await prisma.question.create({
      data: {
        subjectId,
        topicId: topicId || null,
        questionEn,
        questionHi: questionHi || null,
        explanationEn: explanationEn || null,
        explanationHi: explanationHi || null,
        difficulty: difficulty as Difficulty,
        type: type as QuestionType,
        defaultMarks,
        defaultNegativeMarks,
        options: {
          create: options.map((opt, idx) => ({
            optionKey: opt.optionKey,
            contentEn: opt.contentEn,
            contentHi: opt.contentHi || null,
            isCorrect: opt.isCorrect,
            orderIndex: opt.orderIndex ?? idx,
          })),
        },
      },
      include: {
        options: true,
        subject: true,
        topic: true,
      },
    });

    return successResponse(newQuestion, "Question created successfully", 201);
  } catch (error: any) {
    console.error("Admin Question POST Error:", error);
    return errorResponse("Failed to create question", 500);
  }
}
