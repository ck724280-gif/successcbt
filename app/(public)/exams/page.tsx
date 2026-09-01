import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { GraduationCap, ChevronRight, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 0;

export default async function ExamsDirectoryPage() {
  const categories = await prisma.category.findMany({
    include: {
      exams: {
        where: { isPublished: true },
        include: {
          _count: {
            select: { tests: { where: { isPublished: true } } },
          },
        },
        orderBy: { title: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <Layers className="w-4 h-4" />
          <span>Examinations Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore All Competitive Exams & Tests
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-3xl">
          Browse through our extensive library of competitive recruitment exams, full mock test series, and topic-wise speed quizzes.
        </p>
      </div>

      {/* Categories & Exams List */}
      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {cat.name}
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {cat.exams.length} Exams Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-bold">
                        {exam._count.tests} Mock Tests
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {exam.description || "Official syllabus pattern tests with full solutions."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>View Test Series</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
