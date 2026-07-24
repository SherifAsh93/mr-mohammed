# Project Overview

**Mr. Mohammed** is an online teaching platform for an Arabic language and Islamic Studies teacher. Students register via phone number, enroll in courses, pay via Vodafone Cash, and join live video sessions directly inside the website. The teacher manages everything through a hidden admin panel accessed by triple-clicking the site logo.

- **Live URL:** https://mohammedcourses.vercel.app
- **GitHub:** https://github.com/SherifAsh93/mr-mohammed
- **Local path:** `/home/sherif/sites/mr-mohammed`
- **Deployment:** Vercel (auto-deploys on push to `main`)
- **Language:** Arabic, RTL layout

---

## Features

### Student-facing
- **Home page** — teacher intro, quick nav tabs, always-visible step-by-step enrollment guide
- **Courses page** — browse course cards with subject, schedule, price; enroll inline with Vodafone Cash payment reference
- **Student registration** — phone + password; account stays pending until admin approval
- **Student login** — JWT httpOnly cookie, 30-day session
- **Student dashboard** — shows only confirmed enrollments; lists sessions with "Join Session" button; materials tab with downloadable links/PDFs
- **Materials page** — publicly visible study materials grouped by subject
- **Contact page** — WhatsApp and direct phone links (01007050667)
- **PWA** — installable via `manifest.json`, Apple Web App meta, bottom nav bar, Cairo Arabic font

### Admin-facing (hidden panel)
- **Access:** Triple-click site logo → password modal → `sessionStorage` token
- **Admin dashboard** — live counts of courses, enrollments, materials, results; quick-action links; teacher workflow guide
- **Courses CRUD** — create/edit/delete courses with title, subject, schedule text, price, max students, status (`open`/`upcoming`/`closed`)
- **Sessions panel** — per-course sessions with auto-generated Jitsi room names; date+time picker; "Start Session Now" Jitsi button for teacher; recorded video URL field
- **Students management** — approve/reject student accounts
- **Enrollments viewer** — see all enrollments with payment receipt; approve/cancel
- **Attendance tracking** — per-session attendance marking (present/absent)
- **Materials CRUD** — add/edit/delete links, PDFs, video materials by subject
- **Exam results** — add/edit/delete student results with score and max score
- **Settings** — change admin password (bcrypt stored in DB)

### Live Video (Jitsi)
- Teacher opens "Start Session Now" → Jitsi opens fullscreen inside the admin
- Students open "Join Session" → same Jitsi room opens fullscreen inside the dashboard
- Room names auto-generated server-side (`mrm-{random}`) — no external app needed
- Lobby disabled so students enter directly after teacher starts
- `knockingParticipant` event auto-admits waiting students (safety net)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, Cairo Google Font (Arabic + Latin) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM 0.45 + drizzle-kit |
| Auth (admin) | bcryptjs password check → `randomUUID()` token in `sessionStorage` |
| Auth (student) | jose JWT (HS256) → httpOnly cookie `student_token` (30d) |
| Video calls | Jitsi Meet External API (public `meet.jit.si`) |
| Hosting | Vercel |
| PWA | Web app manifest + Apple meta tags |

---

## Folder Structure

```
mr-mohammed/
├── app/
│   ├── layout.tsx              # Root — Cairo font, lang="ar" dir="rtl", BottomNav
│   ├── page.tsx                # Home — teacher intro, quick tabs, enrollment guide
│   ├── globals.css             # Tailwind base + glass effects + slide-up animation
│   ├── courses/page.tsx        # Course listing + enrollment form + Vodafone Cash box
│   ├── materials/page.tsx      # Public study materials by subject
│   ├── contact/page.tsx        # WhatsApp + phone (01007050667)
│   ├── login/page.tsx          # Student login (phone + password)
│   ├── register/page.tsx       # Student self-registration
│   ├── results/page.tsx        # Student results lookup
│   ├── dashboard/page.tsx      # Student dashboard — courses, sessions, materials
│   ├── admin/
│   │   ├── layout.tsx          # Admin shell — sidebar nav (desktop) + hamburger (mobile)
│   │   ├── page.tsx            # Admin overview — stats + quick actions + teacher guide
│   │   ├── courses/page.tsx    # Courses CRUD + sessions panel + Jitsi start button
│   │   ├── students/page.tsx   # Student approval / rejection
│   │   ├── enrollments/page.tsx# Enrollment viewer + payment receipt
│   │   ├── attendance/page.tsx # Attendance marking per session
│   │   ├── materials/page.tsx  # Materials CRUD
│   │   ├── results/page.tsx    # Exam results CRUD
│   │   └── settings/page.tsx   # Admin password change
│   └── api/
│       ├── auth/login/route.ts # POST — bcrypt check → UUID token
│       ├── courses/route.ts    # GET all / POST new
│       ├── courses/[id]/route.ts # PUT / DELETE
│       ├── sessions/route.ts   # GET ?courseId=X / POST new (auto room name)
│       ├── sessions/[id]/route.ts # DELETE
│       ├── enrollments/route.ts # GET all / POST new
│       ├── enrollments/[id]/route.ts # PATCH status / DELETE
│       ├── materials/route.ts  # GET all / POST new
│       ├── materials/[id]/route.ts # PUT / DELETE
│       ├── results/route.ts    # GET all / POST new
│       ├── results/[id]/route.ts # PUT / DELETE
│       ├── attendance/route.ts # Attendance CRUD
│       ├── settings/route.ts   # GET/PUT admin password
│       ├── users/route.ts      # Student user management
│       ├── student/login/route.ts    # Student login → JWT cookie
│       ├── student/logout/route.ts   # Clear cookie
│       ├── student/register/route.ts # Student registration
│       ├── student/me/route.ts       # Auth-gated: current student
│       ├── student/dashboard/route.ts # Auth-gated: courses + sessions + materials
│       └── seed/route.ts       # GET — create tables + seed default password (run once)
├── components/
│   ├── Header.tsx              # Sticky header with AdminTrigger logo
│   ├── AdminTrigger.tsx        # Triple-click logo → password modal → admin redirect
│   ├── BottomNav.tsx           # PWA bottom nav (Home, Courses, Dashboard, Materials, Contact)
│   └── JitsiSession.tsx        # Jitsi Meet iframe via External API
├── db/
│   ├── schema.ts               # All Drizzle table definitions (prefixed mrm_)
│   └── index.ts                # Neon + Drizzle client
├── lib/
│   └── auth-student.ts         # JWT sign/verify helpers + cookie utilities
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # icon-192.png, icon-512.png
├── middleware.ts               # Protects /dashboard — redirects to /login if no valid JWT
├── drizzle.config.ts           # Drizzle Kit config (reads .env.local)
├── next.config.ts              # serverActions bodySizeLimit: 2mb
├── vercel.json                 # alias: mohammedcourses.vercel.app
└── package.json
```

---

## Database

**Provider:** Neon PostgreSQL (serverless). All tables prefixed `mrm_` to avoid conflicts on shared DB.

### `mrm_admin_settings`
| Column | Type | Notes |
|--------|------|-------|
| key | varchar(100) PK | e.g. `"admin_password"` |
| value | text | bcrypt hash |
| updated_at | timestamp | auto |

### `mrm_users` (students)
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(255) | |
| phone | varchar(30) | unique login identifier |
| password_hash | varchar(255) | bcrypt |
| status | varchar(20) | `active` (default) |
| created_at | timestamp | |

### `mrm_courses`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | varchar(255) | |
| description | text | nullable |
| subject | varchar(100) | e.g. اللغة العربية / التربية الإسلامية |
| schedule_text | varchar(255) | Free-form e.g. "السبت 8 مساءً" |
| status | varchar(20) | `open` / `upcoming` / `closed` |
| max_students | integer | 0 = unlimited |
| price | decimal(10,2) | nullable |
| created_at | timestamp | |

### `mrm_sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| course_id | integer FK | → mrm_courses.id |
| title | varchar(255) | Free-form label |
| meeting_link | text | Auto-generated `mrm-{random}` — Jitsi room name |
| scheduled_at | timestamp | nullable |
| recorded_url | text | YouTube link after session |
| created_at | timestamp | |

### `mrm_enrollments`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| course_id | integer FK | → mrm_courses.id |
| user_id | integer | nullable FK |
| student_name | varchar(255) | denormalized |
| student_phone | varchar(30) | |
| payment_ref | varchar(100) | Vodafone Cash receipt (optional) |
| status | varchar(20) | `pending` / `confirmed` / `cancelled` |
| created_at | timestamp | |

### `mrm_materials`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | varchar(255) | |
| description | text | nullable |
| subject | varchar(100) | |
| type | varchar(50) | `link` / `pdf` / `video` |
| url | text | |
| created_at | timestamp | |

### `mrm_results`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| student_name | varchar(255) | |
| student_code | varchar(50) | nullable |
| subject | varchar(100) | |
| exam_name | varchar(255) | |
| score | decimal(5,2) | |
| max_score | decimal(5,2) | default 100 |
| created_at | timestamp | |

### `mrm_attendance`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| session_id | integer FK | |
| enrollment_id | integer FK | |
| status | varchar(20) | `present` / `absent` |
| created_at | timestamp | |
| — | unique | (session_id, enrollment_id) |

---

## Environment Variables

Names only — set in Vercel dashboard (never committed to git):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `STUDENT_JWT_SECRET` | Yes | Secret for signing student JWT tokens (falls back to insecure dev string if unset) |
| `NEXT_PUBLIC_SITE_URL` | No | Used in metadata for canonical URL (defaults to `https://mr-mohammed-gamma.vercel.app`) |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/SherifAsh93/mr-mohammed
cd mr-mohammed

# 2. Install
npm install

# 3. Set environment
cp .env.local.example .env.local  # or create manually
# Add: DATABASE_URL=... and STUDENT_JWT_SECRET=...

# 4. Run dev server
npm run dev
# Runs on http://localhost:3000

# 5. First-time DB setup (once only)
# Visit: http://localhost:3000/api/seed
# This creates all tables and seeds the default admin password

# 6. Run production build check
npm run build
```

### Drizzle migrations (if needed)
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

## Deployment

- **Method:** Push to `main` → Vercel auto-deploys (no manual deploy command needed)
- **Platform:** Vercel
- **Alias:** `mohammedcourses.vercel.app` (set in `vercel.json`)
- **Build command:** `next build` (Turbopack)
- **Node version:** 20+

### First deploy steps
1. Add `DATABASE_URL` and `STUDENT_JWT_SECRET` in Vercel dashboard → Settings → Environment Variables
2. Push to main to trigger deploy
3. Visit `https://mohammedcourses.vercel.app/api/seed` once to initialize the database
4. Log in via triple-click logo and change password from Settings

---

## Current Status

**LIVE and in production** as of 2026-07-24.

- All pages functional (home, courses, materials, contact, login, dashboard)
- Admin panel fully operational (courses, sessions, students, enrollments, attendance, materials, results, settings)
- Jitsi Meet integration working — lobby disabled, auto-admit enabled
- PWA installable on mobile
- Build: passing clean (Next.js 16.2.10, Turbopack, exit code 0)
- One deprecation warning: `middleware` file convention deprecated in Next.js 16 — should migrate to `proxy` convention (non-blocking for now)

---

## Known Issues

1. **Middleware deprecation warning** — Next.js 16 deprecates the `middleware.ts` file convention in favor of `proxy`. The current middleware (`/dashboard` route protection) still works but shows a build warning. Migrate when convenient.
2. **Admin token is UUID, not JWT** — `sessionStorage` stores a UUID returned by `/api/auth/login`. This token is not verified server-side on subsequent admin API requests (admin APIs rely on client-side `sessionStorage` check). Fine for a single-teacher use case, but not scalable.
3. **Student `user_id` in enrollments is nullable** — enrollments can exist without a linked `mrm_users` record (when enrolled without creating an account first). This dual-path works but adds complexity.
4. **No rate limiting** on login endpoints — brute force is possible. Low risk given audience size.

---

## Future Improvements

- Migrate `middleware.ts` → `proxy.ts` per Next.js 16 convention
- Add server-side admin token verification (store sessions in DB or use signed JWT)
- Add push notifications for session start
- Add recorded video embed on student dashboard once `recorded_url` is set
- Student password reset via phone verification (currently requires admin to reset)
- Email/SMS notification on enrollment approval
- Pagination for admin tables (enrollments, results) as data grows

---

## Reusable Assets

The following components and patterns from this project are reusable in future projects:

| Asset | Location | Description |
|-------|----------|-------------|
| `AdminTrigger` | `components/AdminTrigger.tsx` | Hidden admin access via N-click pattern with password modal |
| `JitsiSession` | `components/JitsiSession.tsx` | Full Jitsi Meet embed with lobby disable + auto-admit |
| `BottomNav` | `components/BottomNav.tsx` | PWA bottom navigation bar with active state icons |
| `auth-student.ts` | `lib/auth-student.ts` | Complete JWT student auth: sign, verify, cookie helpers |
| DB schema pattern | `db/schema.ts` | Table prefix strategy (`mrm_`) for shared Neon DBs |
| Arabic RTL layout | `app/layout.tsx` | Cairo font + `lang="ar" dir="rtl"` + PWA meta |
| Vodafone Cash enrollment flow | `app/courses/page.tsx` | Payment-ref-based enrollment for Egyptian cash payments |

---

## Lessons Learned

- **Jitsi lobby must be disabled proactively** — `prejoinPageEnabled: false` alone is not enough; teacher must also run `toggleLobby(false)` on `videoConferenceJoined` and listen for `knockingParticipant` to auto-admit students who arrive before the toggle fires.
- **Triple-click with timeout** — the 1500ms reset timer on `clickCountRef` prevents accidental triggers when the logo is tapped quickly for other reasons.
- **Neon + Drizzle on serverless** — use `neon-http` transport (not `neon-serverless` websocket) for Vercel Functions; avoids cold-start connection issues.
- **Cairo font Arabic subset** — include both `arabic` and `latin` subsets; Latin numbers appear in phone numbers and dates.
- **`sessionStorage` for admin** — intentional: admin session dies on tab close, adding implicit security for a shared-device scenario.
- **`/api/seed` for DB init** — avoids needing CLI access to Neon console on first deploy; teacher can just visit a URL.

---

## WebistryDev Metadata

```yaml
Category: Education / Teacher Portal
Complexity: Medium
Template Candidate: Yes
Priority: Maintenance
Reusable Modules:
  - Hidden admin trigger (N-click pattern)
  - Jitsi Meet embedded video sessions
  - PWA bottom navigation (Arabic RTL)
  - Student JWT auth with httpOnly cookie
  - Vodafone Cash enrollment flow
  - Cairo Arabic font layout
  - Drizzle ORM + Neon serverless setup
Similar Projects:
  - /home/sherif/sites/zahrtelkhlig  (Vercel + Neon ecommerce, same stack)
  - /home/sherif/sites/Montelle      (Vercel + Neon bridal ecommerce, same stack)
  - /home/sherif/sites/Qoya Furniture (Vercel + Neon furniture, same stack)
```
