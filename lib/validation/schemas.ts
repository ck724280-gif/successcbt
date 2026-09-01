import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

export const QuestionOptionSchema = z.object({
  optionKey: z.string().length(1, "Option key must be a single letter (e.g. A, B, C, D)").toUpperCase(),
  contentEn: z.string().min(1, "English option text is required"),
  contentHi: z.string().optional().nullable(),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().default(0),
});

export const QuestionCreateSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  topicId: z.string().optional().nullable(),
  questionEn: z.string().min(3, "English question text is required"),
  questionHi: z.string().optional().nullable(),
  explanationEn: z.string().optional().nullable(),
  explanationHi: z.string().optional().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "NUMERICAL"]).default("SINGLE_CHOICE"),
  defaultMarks: z.number().positive().default(2.0),
  defaultNegativeMarks: z.number().min(0).default(0.5),
  options: z.array(QuestionOptionSchema).min(2, "At least 2 options are required"),
});

// Bulk Import Question Row Schema (supports user JSON / CSV import)
export const BulkImportQuestionRowSchema = z.object({
  question_en: z.string().min(3, "Question (EN) is required"),
  question_hi: z.string().optional().nullable().default(""),
  opt_a_en: z.string().min(1, "Option A (EN) is required"),
  opt_a_hi: z.string().optional().nullable().default(""),
  opt_b_en: z.string().min(1, "Option B (EN) is required"),
  opt_b_hi: z.string().optional().nullable().default(""),
  opt_c_en: z.string().optional().nullable().default(""),
  opt_c_hi: z.string().optional().nullable().default(""),
  opt_d_en: z.string().optional().nullable().default(""),
  opt_d_hi: z.string().optional().nullable().default(""),
  answer: z.string().min(1, "Correct answer key is required (A, B, C, or D)").toUpperCase(),
  explanation_en: z.string().optional().nullable().default(""),
  explanation_hi: z.string().optional().nullable().default(""),
  subject_name: z.string().optional().nullable().default(""),
  topic_name: z.string().optional().nullable().default(""),
  difficulty: z.string().optional().nullable().default("MEDIUM"),
  marks: z.union([z.number(), z.string()]).optional().default(2.0),
  negative_marks: z.union([z.number(), z.string()]).optional().default(0.5),
});

export const BulkImportPayloadSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required for import mapping"),
  topicId: z.string().optional().nullable(),
  questions: z.array(BulkImportQuestionRowSchema).min(1, "At least one question is required for import"),
});

export const TestSectionInputSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  orderIndex: z.number().default(0),
  positiveMarks: z.number().default(2.0),
  negativeMarks: z.number().default(0.5),
  instructions: z.string().optional().nullable(),
  questionIds: z.array(z.string()).default([]),
});

export const TestCreateSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.number().positive("Total marks must be greater than 0"),
  passPercentage: z.number().min(0).max(100).default(40.0),
  positiveMarksPerQ: z.number().default(2.0),
  negativeMarksPerQ: z.number().default(0.5),
  isNegativeMarking: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  isFree: z.boolean().default(true),
  randomQuestionOrder: z.boolean().default(false),
  randomOptionOrder: z.boolean().default(false),
  sections: z.array(TestSectionInputSchema).optional(),
});

// CBT Live Attempt Schemas
export const StartAttemptSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
});

export const SaveAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  sectionId: z.string().optional().nullable(),
  selectedOptionKey: z.string().nullable().optional(), // "A", "B", "C", "D" or null if cleared
  markedForReview: z.boolean().optional().default(false),
  isVisited: z.boolean().optional().default(true),
  isAnswered: z.boolean().optional(),
  timeSpentSeconds: z.number().min(0).optional().default(0),
  currentQuestionIndex: z.number().min(0).optional(),
});

export const SubmitAttemptSchema = z.object({
  timeSpentSeconds: z.number().min(0).optional().default(0),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionKey: z.string().nullable().optional(),
      markedForReview: z.boolean().optional(),
      timeSpentSeconds: z.number().min(0).optional(),
    })
  ).optional(),
});
