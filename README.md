# Amuzic Store & Music Academy

A full-stack monorepo for managing the Amuzic music academy — student enrolment, batches, attendance, fees, demo bookings, and a public-facing storefront.

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

Built with **pnpm workspaces** + **Turborepo**. All packages reference each other via `workspace:*` — no publishing required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (web + admin) | Next.js 14 App Router, React 18, TypeScript |
| API | Express.js, TypeScript, JWT auth via Supabase |
| Database | Supabase (PostgreSQL) |
| State management | TanStack Query v5 (admin), React hooks (web) |
| Forms | React Hook Form v7 + Zod |
| Styling | Custom CSS design system (web uses Tailwind) |
| Monorepo | pnpm workspaces + Turborepo |

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 — install with `npm i -g pnpm`
- A **Supabase** project with the schema applied (see below)

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example files and fill in your Supabase credentials:

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
```

### 3. Apply the database schema

Run the migration files **in order** in your Supabase SQL editor:

```
packages/db/migrations/001_initial_schema.sql
packages/db/migrations/002_triggers.sql
packages/db/migrations/003_rls.sql
packages/db/migrations/004_storage.sql
packages/db/migrations/005_seed.sql
```

### 4. Create the first admin user

1. Go to **Supabase → Authentication → Users → Add user**
2. Enter the director's email and password
3. Run this SQL to give them the director role:

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

This starts all three services in parallel via Turborepo.

### Individual services

```bash
pnpm dev:api      # API server on http://localhost:4000
pnpm dev:web      # Public website on http://localhost:3000
pnpm dev:admin    # Admin console on http://localhost:3001
```

---

## Admin Console

Located at `http://localhost:3001`. Sign in with a `director` or `teacher` account.

### Role-based access

| Feature | Director | Teacher |
|---|---|---|
| Dashboard & reports | ✓ | — |
| All students | ✓ | Own batch students only |
| All batches | ✓ | Own batches only |
| Attendance | ✓ | Own batches only |
| Fees | ✓ | — |
| Demo bookings | ✓ (all) | Own specialization only |
| Teachers management | ✓ | — |
| Products | ✓ | — |

### Creating a teacher account

1. Add user in **Supabase Auth**
2. Insert their profile with `role = 'teacher'`
3. Create a teacher record in the **Teachers** page of the admin console
4. Set their **specializations** (e.g., `keyboard`, `drums`, `guitar`, `vocals`) — these must match the `course_interest` values coming from demo bookings exactly (lowercase)
5. Assign batches to them — they will then see those batches and their students

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth — stores role (director/teacher/student) |
| `courses` | Instrument courses (keyboard, guitar, drums, vocals) with fees |
| `teachers` | Teacher records with specializations array |
| `batches` | Class groups linked to a course and teacher, with schedule |
| `batch_enrollments` | Many-to-many: students ↔ batches |
| `students` | Student profiles with guardian info for child students |
| `attendance` | Per-student per-class attendance (present/absent/late/cancelled) |
| `fee_records` | Monthly and one-time fee records with payment tracking |
| `progress_notes` | Teacher notes on a student's skill progress |
| `demo_bookings` | Demo class requests from the public website |
| `products` | Store inventory (instruments, accessories) |
| `orders` | Store orders |
| `showcase_videos` | Student performance videos for the public site |

---

## Useful Commands

```bash
pnpm build          # Build all packages and apps
pnpm type-check     # TypeScript check across the entire monorepo
pnpm lint           # Lint all packages
```

---

## Project Structure — Admin App

```
apps/admin/src/
├── app/
│   ├── login/              # Login page (director + teacher)
│   └── (dashboard)/        # Protected layout with sidebar
│       ├── dashboard/      # Overview stats (director only)
│       ├── students/       # Student list + detail (5 tabs)
│       ├── batches/        # Batch cards + detail
│       ├── attendance/     # Daily attendance marking
│       ├── fees/           # Fee records + payment collection
│       ├── demos/          # Demo booking management
│       ├── teachers/       # Teacher management (director only)
│       └── reports/        # Monthly reports with CSV export
├── hooks/                  # TanStack Query hooks per domain
├── components/             # RoleGuard, ConfirmDialog, Toast, etc.
├── lib/                    # API client, query key factories
└── providers/              # AuthProvider, QueryProvider
```
