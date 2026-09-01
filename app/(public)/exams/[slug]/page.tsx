import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ArrowLeft, BookOpen, Clock, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 0;

export default async function SingleExamPage({
  params,
}: {
  params: { slug: string };
}) {
  const exam = await prisma.exam.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      tests: {
        where: { isPublished: true },
        include: {
          sections: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, totalQuestions: true },
          },
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
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Breadcrumb & Navigation */}
      <div className="space-y-4">
        <Link
          href="/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Exams
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-bold text-xs">
              {exam.category.name}
            </Badge>
            {exam.code && (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Code: {exam.code}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {exam.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {exam.description || "Official pattern full mock tests and sectional practice sets."}
          </p>
        </div>
      </div>

      {/* Available Tests for this Exam */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Available Mock Tests ({exam.tests.length})
          </h2>
        </div>

        {exam.tests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <p className="text-base font-bold text-slate-700">No mock tests published yet for this exam.</p>
            <p className="text-xs text-slate-500">Please check back soon as new tests are being scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exam.tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Free Online Test
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {test._count.attempts} attempts
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {test.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {test.description || "Full length simulation test with detailed solutions."}
                  </p>

                  {/* Section Badges */}
                  {test.sections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {test.sections.map((sec) => (
                        <span
                          key={sec.id}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                        >
                          {sec.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold text-[11px]">Questions</p>
                      <p className="font-black text-slate-800 mt-0.5">{test._count.testQuestions}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold text-[11px]">Duration</p>
                      <p className="font-black text-slate-800 mt-0.5">{test.durationMinutes}m</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold text-[11px]">Marks</p>
                      <p className="font-black text-slate-800 mt-0.5">{test.totalMarks}</p>
                    </div>
                  </div>

                  <Link href={`/tests/${test.slug}`} className="block">
                    <Button variant="primary" className="w-full font-bold justify-center gap-1.5 shadow-sm">
                      Start Test
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
