import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  Search,
  Zap,
  TrendingUp,
  Award,
  Users,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Share2,
  CheckCircle2,
  Trophy,
  Sparkles,
  ShieldCheck,
  Star,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, tests, countStats] = await Promise.all([
    prisma.category.findMany({
      include: { exams: { where: { isPublished: true } } },
    }),
    prisma.test.findMany({
      where: { isPublished: true },
      include: {
        exam: { select: { title: true, slug: true } },
        _count: { select: { testQuestions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.test.count({ where: { isPublished: true } }),
      prisma.attempt.count(),
    ]),
  ]);

  const [totalUsers, totalTests, totalAttempts] = countStats;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Top Search Header (Testbook style Screenshot 2) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-3xl mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search for your Exam (e.g. SSC CGL, RRB NTPC, IBPS PO)..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00baf2] shadow-xs"
          />
        </div>
      </div>

      {/* 2. Your Recent Test Series (Screenshot 2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Your Recent Test Series
          </h2>
          <Link href="/dashboard/history" className="text-xs font-bold text-[#00baf2] hover:underline">
            View all Attempted Tests →
          </Link>
        </div>

        {/* Horizontal Test Series Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tests.slice(0, 4).map((t, idx) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Header Gradient */}
              <div className="bg-gradient-to-r from-purple-100/70 via-blue-50/60 to-purple-50 p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-white border border-amber-300 shadow-xs flex items-center justify-center font-black text-amber-700 text-xs">
                  🏛️
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>{(1500 + idx * 230).toFixed(1)}k Students</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.exam.title}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                    {t.title}
                  </h3>
                </div>

                {/* Progress */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>{t._count.testQuestions} Questions</span>
                    <span className="text-[#00baf2] font-bold">{t.durationMinutes} mins</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00baf2] rounded-full" style={{ width: `${(idx + 1) * 25}%` }} />
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/tests/${t.slug}`} className="block pt-2">
                  <Button className="w-full bg-[#00baf2] hover:bg-[#00a3d4] text-white font-bold text-xs py-2 rounded-xl shadow-xs">
                    Go To Test Series
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Your Enrolled Test Series Grid (Screenshot 2) */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Your Enrolled Test Series
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href="/exams"
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-[#00baf2] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-700">
                  {idx === 0 ? "🏛️" : idx === 1 ? "🏦" : "🚆"}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#00baf2] transition-colors line-clamp-1">
                    {cat.name} Mock Series
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {cat.exams.length * 24}+ Tests Available
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00baf2] transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Live Mock Tests & PYP List (Screenshot 3 style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Test List with Mock Tests / PYPs Tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Pill Tabs (Screenshot 3) */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 rounded-full bg-white text-slate-800 border border-slate-300 font-bold text-xs shadow-xs">
              Mock Tests
            </button>
            <button className="px-4 py-1.5 rounded-full bg-[#00baf2] text-white font-bold text-xs shadow-xs">
              PYPs (Previous Year Papers)
            </button>
          </div>

          {/* Sub-Tabs (Underline cyan) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center gap-4 overflow-x-auto text-xs font-bold scrollbar-none">
            <span className="px-3 py-1.5 text-[#00baf2] border-b-2 border-[#00baf2] whitespace-nowrap cursor-pointer">
              SSC CGL PYST ({tests.length})
            </span>
            <span className="px-3 py-1.5 text-slate-500 hover:text-slate-800 whitespace-nowrap cursor-pointer">
              IBPS PO Prelims
            </span>
            <span className="px-3 py-1.5 text-slate-500 hover:text-slate-800 whitespace-nowrap cursor-pointer">
              RRB NTPC CBT-1
            </span>
          </div>

          {/* Year Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <span className="px-3 py-1 bg-slate-800 text-white rounded-md cursor-pointer font-bold">All</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">2026</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">2025</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">2024</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">2023</span>
          </div>

          {/* Test Cards List (Screenshot 3 exact cards) */}
          <div className="space-y-3">
            {tests.map((test, idx) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-[#00baf2] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#00baf2] transition-colors">
                      PYST {idx + 1}: {test.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {(76000 + idx * 5100)} / 82400 Rank
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        {test.totalMarks} Marks
                      </span>
                      <span>•</span>
                      <span className="text-[#00baf2] font-semibold">
                        {test.durationMinutes} Mins
                      </span>
                    </div>
                  </div>

                  {/* Right Action Buttons (Solution / Analysis / Start Test) */}
                  <div className="flex items-center gap-2">
                    <Link href={`/tests/${test.slug}`}>
                      <Button
                        size="sm"
                        className="bg-[#00baf2] hover:bg-[#00a3d4] text-white font-bold text-xs px-4 rounded-xl shadow-xs"
                      >
                        Start Test
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Card Footer: Attempt status, Reattempt, Share */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      Official NTA Pattern
                    </span>
                    <Link
                      href={`/tests/${test.slug}`}
                      className="text-[#00baf2] font-semibold hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reattempt
                    </Link>
                  </div>
                  <button className="flex items-center gap-1 text-slate-400 hover:text-slate-700">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Testbook Benefits & Cashback Widget (Screenshot 3) */}
        <div className="space-y-4">
          {/* Why Take this Test Series */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Why Take this Test Series?
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">All India Rank</p>
                  <p className="text-slate-500 text-[11px]">Compete with thousands of students across India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Personal recommendation</p>
                  <p className="text-slate-500 text-[11px]">Recommendations for you based on your strong & weak areas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">No.1 Quality</p>
                  <p className="text-slate-500 text-[11px]">Designed by experts with years of experience on latest pattern</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earn Cashback banner */}
          <div className="bg-gradient-to-br from-[#00baf2] to-teal-600 text-white rounded-2xl p-5 space-y-2 shadow-xs">
            <h4 className="font-bold text-sm">Pass Pro Active</h4>
            <p className="text-[11px] text-teal-100">
              Unlimited access to 70,000+ Mock Tests & PYPs with instant solutions.
            </p>
            <div className="pt-2">
              <Link href="/exams">
                <button className="w-full bg-white text-[#00baf2] font-bold text-xs py-2 rounded-xl shadow-xs hover:bg-teal-50">
                  Explore All Tests →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
