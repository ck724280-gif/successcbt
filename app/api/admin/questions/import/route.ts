import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/apiResponse";
import { BulkImportPayloadSchema } from "@/lib/validation/schemas";
import { Difficulty, QuestionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const body = await req.json();
    const parsed = BulkImportPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error in import payload", 400, parsed.error.format());
    }

    const { subjectId, topicId, questions } = parsed.data;

    // Verify Subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      return errorResponse("Selected subject does not exist.", 404);
    }

    // Fetch existing question texts in this subject to detect duplicates
    const existingQuestions = await prisma.question.findMany({
      where: { subjectId },
      select: { questionEn: true },
    });
    const existingSet = new Set(
      existingQuestions.map((q) => q.questionEn.trim().toLowerCase())
    );

    const importedQuestions: any[] = [];
    const skippedDuplicates: any[] = [];
    const invalidRows: any[] = [];
    const batchSeenSet = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const row = questions[i];
      const rowNumber = i + 1;
      const normalizedText = row.question_en.trim().toLowerCase();

      // Check duplicate in DB or in current batch
      if (existingSet.has(normalizedText) || batchSeenSet.has(normalizedText)) {
        skippedDuplicates.push({
          row: rowNumber,
          question: row.question_en,
          reason: "Duplicate question already exists.",
        });
        continue;
      }
      batchSeenSet.add(normalizedText);

      // Validate answer key
      const answerKey = row.answer.trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(answerKey)) {
        invalidRows.push({
          row: rowNumber,
          question: row.question_en,
          reason: `Invalid answer key '${row.answer}'. Must be A, B, C, or D.`,
        });
        continue;
      }

      // Check required options
      if (!row.opt_a_en || !row.opt_b_en) {
        invalidRows.push({
          row: rowNumber,
          question: row.question_en,
          reason: "Option A and Option B are mandatory.",
        });
        continue;
      }

      // Prepare options list
      const options = [
        {
          optionKey: "A",
          contentEn: row.opt_a_en.trim(),
          contentHi: row.opt_a_hi?.trim() || null,
          isCorrect: answerKey === "A",
          orderIndex: 0,
        },
        {
          optionKey: "B",
          contentEn: row.opt_b_en.trim(),
          contentHi: row.opt_b_hi?.trim() || null,
          isCorrect: answerKey === "B",
          orderIndex: 1,
        },
      ];

      if (row.opt_c_en && row.opt_c_en.trim().length > 0) {
        options.push({
          optionKey: "C",
          contentEn: row.opt_c_en.trim(),
          contentHi: row.opt_c_hi?.trim() || null,
          isCorrect: answerKey === "C",
          orderIndex: 2,
        });
      }

      if (row.opt_d_en && row.opt_d_en.trim().length > 0) {
        options.push({
          optionKey: "D",
          contentEn: row.opt_d_en.trim(),
          contentHi: row.opt_d_hi?.trim() || null,
          isCorrect: answerKey === "D",
          orderIndex: 3,
        });
      }

      // Ensure marked correct option actually exists in options
      const hasCorrect = options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        invalidRows.push({
          row: rowNumber,
          question: row.question_en,
          reason: `Correct option '${answerKey}' was specified, but Option ${answerKey} is empty.`,
        });
        continue;
      }

      // Difficulty mapping
      let diff: Difficulty = Difficulty.MEDIUM;
      if (row.difficulty) {
        const d = row.difficulty.toUpperCase();
        if (d === "EASY") diff = Difficulty.EASY;
        else if (d === "HARD") diff = Difficulty.HARD;
      }

      const marks = typeof row.marks === "number" ? row.marks : parseFloat(row.marks) || 2.0;
      const negativeMarks =
        typeof row.negative_marks === "number"
          ? row.negative_marks
          : parseFloat(row.negative_marks) || 0.5;

      importedQuestions.push({
        subjectId,
        topicId: topicId || null,
        questionEn: row.question_en.trim(),
        questionHi: row.question_hi?.trim() || null,
        explanationEn: row.explanation_en?.trim() || null,
        explanationHi: row.explanation_hi?.trim() || null,
        difficulty: diff,
        type: QuestionType.SINGLE_CHOICE,
        defaultMarks: marks,
        defaultNegativeMarks: negativeMarks,
        options,
      });
    }

    if (importedQuestions.length === 0) {
      return errorResponse("No valid questions could be imported from the file.", 400, {
        skippedDuplicates,
        invalidRows,
      });
    }

    // Persist all valid questions in a transaction
    await prisma.$transaction(async (tx) => {
      for (const q of importedQuestions) {
        await tx.question.create({
          data: {
            subjectId: q.subjectId,
            topicId: q.topicId,
            questionEn: q.questionEn,
            questionHi: q.questionHi,
            explanationEn: q.explanationEn,
            explanationHi: q.explanationHi,
            difficulty: q.difficulty,
            type: q.type,
            defaultMarks: q.defaultMarks,
            defaultNegativeMarks: q.defaultNegativeMarks,
            options: {
              create: q.options,
            },
          },
        });
      }
    });

    return successResponse(
      {
        totalProcessed: questions.length,
        importedCount: importedQuestions.length,
        skippedCount: skippedDuplicates.length,
        invalidCount: invalidRows.length,
        skippedDuplicates,
        invalidRows,
      },
      `Successfully imported ${importedQuestions.length} questions.`
    );
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return errorResponse("Failed to process bulk question import", 500);
  }
}
