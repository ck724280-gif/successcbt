# 🎯 ParikshaCBT — Modern Competitive Exam Computer-Based Test Platform

A high-performance, secure, and production-ready **Computer-Based Testing (CBT)** examination web application inspired by leading Indian competitive examination platforms (such as Testbook, NTA, SSC CGL, IBPS Banking, and RRB Railways).

Built from the ground up with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **NextAuth.js**, architected specifically for instant GitHub push and **Vercel Cloud Deployment**.

---

## 🌟 Key Highlights & Features

### 🖥️ 1. Real Competitive Exam (CBT) Interface
- **NTA & Competitive Exam Pattern**: Full examination screen with Question Canvas, Section Switcher, and right-hand **Question Palette**.
- **Visual Question States (Color Coded)**:
  - 🟢 **Green**: Answered
  - 🔴 **Red**: Not Answered (Visited but not selected)
  - 🟣 **Purple**: Marked for Review
  - 🟣🟢 **Purple with Badge**: Answered & Marked for Review
  - ⚪ **Gray**: Not Visited
- **Dual Language Support (English | हिन्दी)**: Every question, option, and explanation supports both English and Hindi with an instant one-click toggle.
- **Action Bar Controls**: `<< Previous`, `Clear Response`, `Mark for Review & Next`, `Save & Next >>`.
- **Question Paper View Modal**: Allows candidate to preview all test questions in one unified modal.

### ⚡ 2. Anti-Loss Auto Save Engine
- **Accidental Refresh & Network Proof**: Answers, visited markers, marked-for-review tags, and current question indices are safely auto-synced to the server in real-time.
- **Seamless Resumption**: If a candidate refreshes or closes the browser, the attempt is resumed immediately with exact palette states and remaining time restored.
- **Idempotent Submission**: Double submissions or expired attempts are handled cleanly without duplicate evaluation.

### ⏱️ 3. Server-Synchronized Timer
- **Tamper-Proof**: Attempt start time and expiry timestamp are computed and validated server-side.
- **Low Time Warnings**: Real-time visual alerts when timer is below 5 minutes and 1 minute.
- **Automated Expiry Submission**: Non-dismissible countdown modal submits responses automatically when the timer reaches `00:00`.

### 📊 4. Centralized Scoring Engine & Detailed Solution Review
- **Deterministic Evaluation**: Centralized pure scoring module calculating Correct Count, Incorrect Count, Unattempted Count, Positive Score, Negative Penalties, Final Score, Accuracy %, and Percentage.
- **Detailed Solution Mode**: Question-by-question review with filters (`All`, `Correct`, `Incorrect`, `Unattempted`, `Marked for Review`), showing the candidate's answer vs official answer with step-by-step verified explanations in English and हिन्दी.
- **Sectional Breakdown**: Section-by-section accuracy, score, and question count analytics.

### 🛠️ 5. Admin Dashboard & Bulk Question Import Tool
- **Live Platform Metrics**: Real-time stats on registered candidates, active tests, question bank size, total submissions, and average platform accuracy.
- **Bulk Question Import (JSON & CSV)**:
  - Supports standard bilingual JSON array or CSV uploads.
  - Automated client & server Zod schema validation.
  - Live Preview Table with error highlighting.
  - In-browser inline cell editing before final database commit.
  - Duplicate question detection against the existing database.
- **Test Management**: Full wizard to create and publish tests with duration, total marks, negative marking rules, sections, and question bank mapping.
- **User Management**: View candidates, test attempt counters, search, and toggle suspension or admin roles.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14+ (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Compatible with Neon, Supabase, Vercel Postgres, AWS RDS) |
| **ORM** | [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js (Auth.js)](https://next-auth.js.org/) with Credentials & JWT Strategy |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with Lucide Icons |
| **Data Parsing** | [PapaParse](https://www.papaparse.com/) & Zod Validation |
| **Testing** | [Vitest](https://vitest.dev/) Unit Testing Suite |
| **Deployment Target** | [Vercel](https://vercel.com/) (Serverless Ready) |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm** or **yarn**
- **PostgreSQL Database** (e.g. Local PostgreSQL, [Neon.tech](https://neon.tech), [Supabase](https://supabase.com))

### 2. Clone and Install Dependencies
```bash
# Clone repository
git clone https://github.com/your-username/cbt-test-platform.git
cd cbt-test-platform

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your PostgreSQL database URL and NextAuth secret:
```env
# PostgreSQL connection string (Use pooled connection URL for Vercel/Serverless)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cbt_platform?schema=public"

# Direct URL for Prisma migrations
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/cbt_platform?schema=public"

# NextAuth Secret (Generate with `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-32-character-secret-key-goes-here"
NEXTAUTH_URL="http://localhost:3000"

NODE_ENV="development"
```

### 4. Run Database Migrations and Seed Sample Data
```bash
# Push schema to database
npx prisma db push

# (Or run migrations in development)
# npx prisma migrate dev --name init

# Seed database with demo exams, bilingual questions, mock tests, and admin/user accounts
npx tsx prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

The seed script creates pre-configured accounts with 1-click fill buttons on the login page:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cbt.com` | `Admin@12345` | `/admin` (Admin Control Panel) |
| **Candidate / User** | `user@cbt.com` | `User@12345` | `/dashboard` (Candidate Exam Portal) |

---

## 🧪 Running Automated Unit Tests

Automated unit tests verify the scoring engine, negative marking formulas, accuracy calculations, and sectional aggregations:
```bash
# Run all unit tests with Vitest
npm test

# Run tests in watch mode
npm run test:watch
```

---

## ☁️ Vercel Deployment Step-by-Step Guide

The platform is designed to be 100% cloud and serverless friendly for Vercel deployment.

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "feat: complete modern CBT examination platform"
git branch -M main
git remote add origin https://github.com/your-username/cbt-test-platform.git
git push -u origin main
```

### Step 2: Create a Cloud PostgreSQL Database
Get a free serverless PostgreSQL database from:
- [Neon Serverless Postgres](https://neon.tech) (Recommended - instant setup)
- [Supabase](https://supabase.com)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

Copy both the **Pooled Connection URL** (with `?pgbouncer=true`) and the **Direct Connection URL**.

### Step 3: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Select your GitHub repository `cbt-test-platform`.
3. Under **Environment Variables**, add the following:

| Variable Name | Description / Example Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-cool-pooler.neon.tech/cbtdb?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | `postgresql://user:pass@ep-cool-direct.neon.tech/cbtdb?sslmode=require` |
| `NEXTAUTH_SECRET` | Generate a 32+ character string (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-production-app.vercel.app` (or your custom domain) |
| `NODE_ENV` | `production` |

### Step 4: Run Production Database Migration & Seed
Before or right after your first deployment, push the database schema and seed data from your terminal:
```bash
# Set production DATABASE_URL in your terminal or use local CLI
DATABASE_URL="your-production-db-url" DIRECT_URL="your-production-direct-url" npx prisma db push
DATABASE_URL="your-production-db-url" DIRECT_URL="your-production-direct-url" npx tsx prisma/seed.ts
```

### Step 5: Deploy
Click **"Deploy"** in Vercel. Your CBT platform will be live in under 2 minutes!

---

## 📁 Project Architecture & Directory Structure

```text
cbt-test/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Login with 1-click Demo Fill
│   │   └── register/page.tsx            # Candidate Registration
│   ├── (public)/
│   │   ├── page.tsx                     # Modern Homepage
│   │   ├── exams/page.tsx               # Exam Categories Directory
│   │   ├── exams/[slug]/page.tsx        # Single Exam Test Series
│   │   └── tests/[slug]/page.tsx        # Test Instructions & Start Confirmation
│   ├── dashboard/
│   │   ├── page.tsx                     # Candidate Dashboard & Active Attempt Resume
│   │   ├── history/page.tsx             # Complete Attempt History
│   │   └── profile/page.tsx             # User Profile & Settings
│   ├── test/[attemptId]/page.tsx        # 🚀 Core Interactive CBT Examination Engine
│   ├── result/[attemptId]/page.tsx      # 📊 Scorecard & Question-by-Question Solutions
│   ├── admin/
│   │   ├── layout.tsx                   # Admin Role Guard & Layout
│   │   ├── page.tsx                     # Admin Analytics & Dashboard
│   │   ├── tests/page.tsx               # Mock Test CRUD & Publish Toggle
│   │   ├── tests/new/page.tsx           # Test Builder Wizard
│   │   ├── questions/page.tsx           # Question Bank Master
│   │   ├── questions/new/page.tsx       # Single Bilingual Question Builder
│   │   ├── questions/import/page.tsx    # 📥 Bulk JSON / CSV Import Tool
│   │   └── users/page.tsx               # Candidate Management
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API Handler
│   │   ├── auth/register/route.ts       # Signup API
│   │   ├── exams/route.ts               # Public Exams API
│   │   ├── tests/route.ts               # Public Tests API
│   │   ├── attempts/route.ts            # Start / Resume Attempt API
│   │   ├── attempts/[id]/route.ts       # Secure Attempt Environment (Answers Stripped)
│   │   ├── attempts/[id]/answer/route.ts# Anti-Loss Answer Auto-Save
│   │   ├── attempts/[id]/submit/route.ts# Server-Side Scoring & Evaluation
│   │   ├── results/[attemptId]/route.ts # Full Result Analysis & Explanations
│   │   ├── user/dashboard/route.ts      # Candidate Metrics
│   │   └── admin/...                    # Admin Stats, Tests, Questions & Users APIs
│   ├── layout.tsx                       # Root Layout with Nav, Footer, Providers
│   └── globals.css                      # Tailwind Styles & Custom Scrollbars
├── components/
│   ├── cbt/                             # CBT Examination Screen Components
│   │   ├── CBTHeader.tsx                # Timer, Section Tabs, Language Switcher
│   │   ├── QuestionCanvas.tsx           # Bilingual Question, Options, Action Buttons
│   │   ├── QuestionPalette.tsx          # Color-coded Status Grid & Candidate Profile
│   │   ├── QuestionPaperModal.tsx       # Full Paper Preview
│   │   ├── SubmitConfirmModal.tsx       # Submission Confirmation & Breakdown
│   │   └── TimeExpiredModal.tsx         # Auto-Submit Expiry Overlay
│   ├── result/                          # Result & Solution Review Components
│   │   ├── ScoreCard.tsx                # Hero Scorecard, Rank, Accuracy, Percentile
│   │   ├── SectionBreakdownTable.tsx    # Sectional Scoring Summary Table
│   │   └── QuestionSolutionReview.tsx   # Verified Bilingual Solutions Review
│   ├── admin/                           # Admin Sidebar & Header Components
│   ├── navbar/Navbar.tsx                # Top Navigation Bar
│   ├── footer/Footer.tsx                # Platform Footer
│   ├── providers/                       # AuthProvider & ToastProvider
│   └── ui/                              # Buttons, Badges, Modals, Cards
├── lib/
│   ├── db/prisma.ts                     # Prisma Client Singleton
│   ├── auth/authOptions.ts              # NextAuth Credentials & Role Handlers
│   ├── scoring/scoringEngine.ts         # Pure Centralized Deterministic Scoring Module
│   ├── validation/schemas.ts            # Zod Validation Schemas
│   └── utils/                           # API Responses, Rate Limiter, Formatting
├── prisma/
│   ├── schema.prisma                    # Normalized PostgreSQL Database Models
│   └── seed.ts                          # Comprehensive Realistic Bilingual Seed Data
├── tests/
│   └── scoring.test.ts                  # Automated Unit Tests for Scoring Engine
├── vercel.json                          # Vercel Deployment Configuration & Headers
├── vitest.config.ts                     # Vitest Testing Configuration
└── package.json                         # Project Dependencies & Scripts
```

---

## 🔒 Security & Data Integrity

1. **Answer & Explanation Stripping**: During an active test attempt (`/api/attempts/:id`), correct answers (`isCorrect`) and explanations (`explanationEn`/`explanationHi`) are **strictly stripped server-side** before the payload reaches the client browser.
2. **Server-Side Scoring**: Scores, positive marks, negative marking deductions, accuracy percentages, and pass/fail thresholds are calculated entirely server-side.
3. **Attempt Ownership Verification**: Candidate authorization is enforced on every attempt, answer update, and result lookup.
4. **Idempotent Submission**: Prevents double submissions or race conditions.
5. **Rate Limiting**: Sensitive endpoints (Registration, Login, Submissions, Imports) are protected with rate-limiting guards.
6. **SQL Injection Protection**: All queries are parameterized via Prisma ORM.

---

## 📄 License
This project is licensed under the MIT License.
