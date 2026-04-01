<div align="center">

<img src="public/icon.png" alt="JobMe Logo" width="80" height="80" style="border-radius: 20px;" />

# JobMe

**A full-stack job portal platform for seekers, recruiters, and admins.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

[Live Demo](https://jobme-portal.app) · [Report Bug](https://github.com/shan/jobme/issues) · [Request Feature](https://github.com/shan/jobme/issues)

</div>

---

## Features

### Job Seeker
- Browse and search job listings
- Apply to jobs with cover letter
- Track application status (pending / approved / rejected)
- Personal dashboard with application history

### Recruiter
- Post and manage job listings
- Review applicants per job
- Approve or reject applications
- Recruiter dashboard with analytics

### Admin
- Full job management (approve / reject listings)
- User management across all roles
- Platform-wide analytics dashboard
- Role-based access control

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Lucide Icons |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Fonts | Geist Sans / Geist Mono |
| Deployment | Vercel |

---

## Project Structure

```
jobme/
├── app/
│   ├── auth/
│   │   └── login/          # Authentication pages
│   ├── dashboard/          # Admin dashboard
│   │   └── jobs/           # Job management
│   ├── recruiter/          # Recruiter portal
│   │   └── jobs/[id]/      # Job applicants view
│   └── seeker/             # Job seeker portal
│       └── applications/   # Application tracker
├── components/
│   ├── layout/
│   │   ├── SplashScreen.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/                 # Reusable UI components
├── features/               # Feature-specific logic
├── lib/                    # Supabase client, utilities
├── public/                 # Static assets
└── supabase/
    └── migrations/         # Database migrations
```

---

## Database Schema

```sql
-- Profiles (extends Supabase auth.users)
profiles (
  id          uuid references auth.users primary key,
  full_name   text,
  email       text not null,
  role        text check (role in ('admin', 'recruiter', 'seeker')),
  created_at  timestamptz default now()
)

-- Jobs
jobs (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  company_name  text not null,
  location      text,
  job_type      text,
  status        text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  skills        text[],
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
)

-- Applications
applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid references jobs(id),
  applicant_id  uuid references profiles(id),
  status        text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  cover_letter  text,
  created_at    timestamptz default now()
)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account

### Installation

```bash
# Clone the repo
git clone https://github.com/shan/jobme.git
cd jobme

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm run build
pnpm run start
```

---

## Role-Based Access

| Route | Admin | Recruiter | Seeker |
|---|---|---|---|
| `/dashboard` | ✅ | ❌ | ❌ |
| `/recruiter` | ❌ | ✅ | ❌ |
| `/seeker` | ❌ | ❌ | ✅ |
| `/auth/login` | ✅ | ✅ | ✅ |

---

## Contributing

Contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feat/your-feature

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to the branch
git push origin feat/your-feature

# 5. Open a Pull Request
```

### Commit Convention

```
feat:     new feature
fix:      bug fix
chore:    maintenance
style:    formatting, UI tweaks
refactor: code restructure
docs:     documentation
```

---

## Deployment

This project is deployed on **Vercel**.

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel --prod
```

Make sure to add your environment variables in Vercel Dashboard → Settings → Environment Variables.

---

<div align="center">

Designed & Developed by **Shan**

</div>
