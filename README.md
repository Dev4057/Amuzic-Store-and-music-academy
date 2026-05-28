# Amuzic Store & Music Academy

A full-stack monorepo for Amuzic Store & Music Academy (Bavdhan, Pune) — student enrolment, batches, attendance, fees, financials, demo bookings, blog, testimonials, and a public-facing website with a student/teacher portal.

---

## Architecture

```
amuzic_academy/
├── apps/
│   ├── web/          # Public website (Next.js 14, port 3000)
│   └── admin/        # Internal admin console (Next.js 14, port 3001)
├── packages/
│   ├── api/          # REST API server (Express, port 4000)
│   ├── db/           # Supabase client + generated types
│   └── shared/       # Shared TypeScript types, Zod schemas, formatters
```

Built with **pnpm workspaces** + **Turborepo 2**. All packages reference each other via `workspace:*` — no publishing required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (web + admin) | Next.js 14 App Router, React 18, TypeScript |
| API | Express.js, TypeScript, JWT auth via Supabase |
| Database | Supabase (PostgreSQL + RLS) |
| State management | TanStack Query v5 (admin), React hooks (web) |
| Forms | React Hook Form v7 + Zod |
| Styling | Custom CSS design system (admin) · Tailwind CSS (web) |
| Monorepo | pnpm workspaces + Turborepo 2 |

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 — install with `npm i -g pnpm`
- A **Supabase** project (free tier works) with the schema applied (see below)

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

**`packages/api/.env`**
```env
PORT=4000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
WEB_URL=http://localhost:3000
REVALIDATE_SECRET=your-random-secret
```

**`apps/admin/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
REVALIDATE_SECRET=your-random-secret
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` must only ever appear in the API server's `.env`. Never put it in any `NEXT_PUBLIC_*` variable.

### 3. Apply the database schema

Run the migration files **in order** in **Supabase → SQL Editor**:

```
packages/db/migrations/001_initial_schema.sql
packages/db/migrations/002_triggers.sql
packages/db/migrations/003_rls.sql
packages/db/migrations/004_storage.sql
packages/db/migrations/005_seed.sql
packages/db/migrations/006_testimonials.sql
packages/db/migrations/007_blog.sql
packages/db/migrations/008_student_portal_rls.sql
packages/db/migrations/009_teacher_attendance.sql
```

### 4. Create the first director account

1. Go to **Supabase → Authentication → Users → Add user**
2. Enter the director's email and a temporary password
3. Run this SQL to assign the director role:

```sql
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Amol Naik', 'director', true
FROM auth.users
WHERE email = 'your-email@example.com';
```

---

## Running Locally

### All apps at once

```bash
pnpm dev
```

Starts all three services in parallel via Turborepo.

### Individual services

```bash
pnpm dev:api      # API server  →  http://localhost:4000
pnpm dev:web      # Public site →  http://localhost:3000
pnpm dev:admin    # Admin panel →  http://localhost:3001
```

---

## Admin Console (`localhost:3001`)

Sign in with a `director` or `teacher` account.

### Role-based access

| Feature | Director | Teacher |
|---|---|---|
| Dashboard & KPIs | ✓ | — |
| Financials & trends | ✓ | — |
| All students | ✓ | Own batch students only |
| All batches | ✓ | Own batches only |
| Attendance | ✓ | Own batches only |
| Fees & payments | ✓ | — |
| Reports (CSV) | ✓ | — |
| Demo bookings | ✓ (all) | Own specialization only |
| Teachers management | ✓ | — |
| Products / Store | ✓ | — |
| Testimonials | ✓ | — |
| Blog posts | ✓ | — |

### Creating a teacher account

1. Go to **Supabase → Authentication → Users → Add user**. Set a temporary password and tick **"Send email confirmation"** off.
2. Insert their profile:
   ```sql
   INSERT INTO profiles (id, email, full_name, role, is_active, must_change_password)
   SELECT id, email, 'Teacher Name', 'teacher', true, true
   FROM auth.users WHERE email = 'teacher@example.com';
   ```
3. In the admin console → **Teachers** page, create a teacher record and set their **specializations** (e.g. `keyboard`, `guitar`, `drums`, `vocals`). These must match `course_interest` values from demo bookings exactly (lowercase).
4. Assign batches to the teacher — they will see those batches and their students when they log in.
5. On first login the teacher is forced to set a new password via the **Change Password** page before accessing the dashboard.

---

## Student & Teacher Portals

The public `web` app also hosts two self-service portals:

| Portal | URL | Purpose |
|---|---|---|
| Student Portal | `/portal` | View attendance, fee history, download receipts |
| Teacher Portal | `/teacher` | View assigned batches and student attendance |

Both portals use Supabase Auth directly (anon key) and are protected by RLS policies (migration `008`).

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth — stores role (`director` / `teacher` / `student`) and `must_change_password` flag |
| `courses` | Instrument courses (keyboard, guitar, drums, vocals) with fees |
| `teachers` | Teacher records with `specializations` array |
| `batches` | Class groups linked to a course and teacher, with schedule days/time |
| `batch_enrollments` | Many-to-many: students ↔ batches |
| `students` | Student profiles with guardian info for child students |
| `attendance` | Per-student per-class attendance (`present` / `absent` / `late` / `cancelled`) |
| `fee_records` | Monthly and one-time fee records; `month_year` (YYYY-MM) tracks billing period |
| `progress_notes` | Teacher notes on a student's skill progress |
| `demo_bookings` | Demo class requests submitted from the public website |
| `products` | Store inventory (instruments, accessories) with stock tracking |
| `orders` | Store orders |
| `showcase_videos` | Student performance videos featured on the public site |
| `testimonials` | Student/parent testimonials shown on the homepage |
| `blog_posts` | Blog/insights articles published on the public site |

---

## API Routes

All routes are prefixed with `/api`.

| Prefix | Description |
|---|---|
| `/auth` | Login, change-password, profile |
| `/students` | CRUD + portal-invite email |
| `/teachers` | CRUD + specializations |
| `/batches` | CRUD, enrol/unenrol students, attendance |
| `/fees` | Fee records, record payment, generate monthly fees |
| `/financials` | 6-month trend, payment-mode breakdown, top pending |
| `/demos` | Demo bookings from the public site |
| `/courses` | Course list and detail |
| `/progress` | Teacher progress notes |
| `/products` | Store product CRUD |
| `/orders` | Store orders |
| `/showcase` | Showcase video management |
| `/dashboard` | Director KPI summary |
| `/reports` | Monthly report data + CSV export |
| `/testimonials` | Testimonial CRUD |
| `/blog` | Blog post CRUD + slug lookup |

---

## Project Structure — Admin App

```
apps/admin/src/
├── app/
│   ├── login/              # Login page (director + teacher)
│   ├── change-password/    # Forced first-login password reset
│   └── (dashboard)/        # Protected layout with sidebar
│       ├── dashboard/      # Overview KPIs (director only)
│       ├── financials/     # 6-month revenue trends & breakdowns
│       ├── students/       # Student list + detail (5 tabs)
│       ├── batches/        # Batch cards + detail + attendance
│       ├── attendance/     # Daily attendance marking
│       ├── fees/           # Fee records + payment collection
│       ├── reports/        # Monthly reports with CSV export
│       ├── demos/          # Demo booking management
│       ├── teachers/       # Teacher management (director only)
│       ├── products/       # Store product management
│       ├── testimonials/   # Testimonial management
│       └── blog/           # Blog post management
├── hooks/                  # TanStack Query hooks per domain
├── components/             # RoleGuard, ConfirmDialog, Toast, PageHeader, etc.
├── lib/                    # API client, query key factories
└── providers/              # AuthProvider, QueryProvider
```

## Project Structure — Web App

```
apps/web/src/
├── app/
│   ├── (site)/             # Public marketing pages
│   │   ├── page.tsx        # Homepage
│   │   ├── courses/        # Course listing + individual course pages
│   │   ├── about/          # About page with faculty section
│   │   ├── contact/        # Contact page
│   │   ├── store/          # Music store
│   │   ├── showcase/       # Student showcase videos
│   │   ├── insights/       # Blog / insights
│   │   ├── why-music/      # Why learn music page
│   │   └── book-demo/      # Demo booking form
│   ├── portal/             # Student self-service portal
│   └── teacher/            # Teacher portal
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── home/               # Homepage section components
```

---

## Useful Commands

```bash
pnpm build          # Build all packages and apps
pnpm type-check     # TypeScript check across the entire monorepo
pnpm lint           # Lint all packages
```

---

## Faculty

| Name | Instrument | Experience |
|---|---|---|
| Mr. Amol Naik | Founder & Director | — |
| Gopal | Keyboard & Guitar | 12+ years |
| Jay Nawale | Drums & Percussion | 8+ years |
| Mrs. Manisha | Vocals | 10+ years |

---

*Amuzic Store & Music Academy · Bakaji Corner, Bavdhan, Pune 411021 · +91 89759 16381*
