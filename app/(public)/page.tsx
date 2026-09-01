import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  Award,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  ChevronRight,
  TrendingUp,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 0; // Dynamic data for live updates

export default async function HomePage() {
  // Fetch featured exams and tests with question counts
  const [categories, featuredTests, statsCount] = await Promise.all([
    prisma.category.findMany({
      include: {
        exams: {
          where: { isPublished: true },
          take: 4,
        },
      },
      take: 4,
    }),
    prisma.test.findMany({
      where: { isPublished: true },
      include: {
        exam: { select: { title: true, slug: true } },
        _count: { select: { testQuestions: true, attempts: true } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.test.count({ where: { isPublished: true } }),
      prisma.question.count(),
      prisma.attempt.count({ where: { status: "SUBMITTED" } }),
    ]),
  ]);

  const [totalUsers, totalTests, totalQuestions, totalAttempts] = statsCount;

  return (
    <div className="flex flex-col space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Glow decorative gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Top Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>NTA & Competitive Exam Pattern CBT Simulator</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Experience Real Exam <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Computer-Based Tests
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Practice SSC, Banking, Railways & State PSC mock tests on an ultra-fast, bilingual (हिन्दी / English) testing interface with live server-sync timers and in-depth performance analytics.
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/exams">
              <Button size="lg" className="font-bold text-base px-8 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 gap-2">
                Explore Mock Tests
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="font-bold text-base px-8 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Real-time stats ribbon */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur text-left">
              <p className="text-2xl sm:text-3xl font-black text-white">{totalTests}+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400">Available Mock Tests</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur text-left">
              <p className="text-2xl sm:text-3xl font-black text-white">{totalQuestions}+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400">Bilingual Questions</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur text-left">
              <p className="text-2xl sm:text-3xl font-black text-white">{totalAttempts}+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400">Tests Attempted</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur text-left">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
              <p className="text-xs sm:text-sm font-medium text-slate-400">Real Exam Simulation</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED MOCK TESTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">
              Curated Practice
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Popular Live Mock Tests
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a test to experience the full-screen NTA exam environment
            </p>
          </div>

          <Link href="/exams" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Tests <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="default" className="font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                    {test.exam.title}
                  </Badge>
                  {test.isFree && (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                      Free Test
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {test.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {test.description || "Comprehensive pattern test with General Awareness, Reasoning, Quant and English."}
                </p>
              </div>

              {/* Test Meta Info */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400 font-semibold">Questions</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5">
                      {test._count.testQuestions} Qs
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400 font-semibold">Duration</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5">
                      {test.durationMinutes} Mins
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-400 font-semibold">Total Marks</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5">
                      {test.totalMarks}
                    </p>
                  </div>
                </div>

                <Link href={`/tests/${test.slug}`} className="block">
                  <Button variant="primary" className="w-full font-bold justify-center gap-2 shadow-sm group-hover:bg-blue-700">
                    Start Test Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EXAM CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-blue-600">
            Target Your Exam
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Exam Categories & Recruitment Portals
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {cat.exams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/exams/${exam.slug}`}
                    className="flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span>{exam.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM ADVANTAGES */}
      <section className="bg-slate-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              Why ParikshaCBT?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Exam Day Confidence
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              We replicate the exact technical and visual environment of competitive examination software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Anti-Loss Auto Saving</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Accidental page refresh or temporary wifi drop? Your state, answers, and visited question palette are safely auto-synced to the server.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Server-Verified Countdown</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Timers are anchored against server timestamps. Auto-submission takes effect on expiry, preventing client-side clock tampering.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Solution & Percentile</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Get immediate scores, accuracy metrics, negative marking calculations, and bilingual step-by-step solutions with explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-500/20">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to test your preparation level?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl">
              Join thousands of aspirants practicing full-length mock tests with real-time ranking and verified explanations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" className="font-bold text-blue-900 bg-white hover:bg-blue-50 shadow-md">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
