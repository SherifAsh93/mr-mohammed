# Mr. Mohammed — PROJECT_CONTEXT

## What It Does

Online teaching platform for an Arabic & Islamic Studies teacher. Students register with phone + password, enroll in courses, and join live video sessions from their personal dashboard. Teacher manages everything via a hidden admin panel. Video calls are embedded directly inside the site via Jitsi Meet (no external apps needed).

**Live URL:** https://mohammedcourses.vercel.app  
**GitHub:** https://github.com/SherifAsh93/mr-mohammed  
**Local:** `/home/sherif/sites/mr-mohammed`  
**Stack:** Next.js 16.2.10 (Turbopack) · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · bcryptjs · jose (JWT)  
**Deploy:** Push to GitHub → Vercel auto-deploys  
**Admin access:** Triple-click the logo → password: `123456` (stored in `sessionStorage`)  
**Student auth:** Phone + password → JWT in httpOnly cookie `student_token` (30-day)  
**Video calls:** Jitsi Meet embedded via External API iframe (`components/JitsiSession.tsx`)

---

## Structure

```
mr-mohammed/
├── app/
│   ├── layout.tsx              # Root layout — Cairo font, RTL, PWA meta
│   ├── page.tsx                # Home page — teacher intro + always-visible student guide
│   ├── globals.css             # Tailwind + glass effects + slide-up animation
│   ├── courses/page.tsx        # Course listing + enrollment form + Vodafone Cash box
│   ├── materials/page.tsx      # Study materials by subject
│   ├── contact/page.tsx        # WhatsApp + phone links (01007050667)
│   ├── dashboard/page.tsx      # Student dashboard — enrolled courses + sessions + join button
│   ├── login/page.tsx          # Student login (phone + password)
│   ├── admin/
│   │   ├── layout.tsx          # Admin shell — sidebar nav + mobile hamburger
│   │   ├── page.tsx            # Admin dashboard overview + teacher guide
│   │   ├── courses/page.tsx    # Courses CRUD + sessions panel + "Start Now" Jitsi button
│   │   ├── students/page.tsx   # Student management (approve/reject)
│   │   ├── enrollments/page.tsx# Enrollment viewer + payment receipt status
│   │   ├── attendance/page.tsx # Attendance tracking per session
│   │   ├── materials/page.tsx  # Materials CRUD
│   │   └── settings/page.tsx   # Admin settings
│   └── api/
│       ├── seed/route.ts       # DB migration + seed (run once via GET /api/seed)
│       ├── auth/route.ts       # POST — bcrypt password check → token
│       ├── courses/
│       │   ├── route.ts        # GET all / POST new
│       │   └── [id]/route.ts   # PUT / DELETE
│       ├── sessions/
│       │   ├── route.ts        # GET ?courseId=X / POST new (auto-generates room name)
│       │   └── [id]/route.ts   # DELETE
│       ├── enrollments/
│       │   ├── route.ts        # GET all / POST new enrollment
│       │   └── [id]/route.ts   # PATCH status / DELETE
│       ├── materials/
│       │   ├── route.ts        # GET all / POST new
│       │   └── [id]/route.ts   # PUT / DELETE
│       ├── student/
│       │   ├── login/route.ts  # Student login → JWT cookie
│       │   ├── logout/route.ts # Clear cookie
│       │   └── dashboard/route.ts # Auth-gated: return student + courses + sessions
│       └── attendance/route.ts # Attendance CRUD
├── components/
│   ├── Header.tsx              # Back-arrow header with title
│   ├── BottomNav.tsx           # PWA bottom navigation (Home, Courses, دروسي, Materials, Contact)
│   └── JitsiSession.tsx        # Jitsi Meet iframe embed (External API, configOverwrite)
├── db/
│   ├── schema.ts               # All tables (prefixed mrm_)
│   └── index.ts                # Neon + Drizzle client
├── public/                     # PWA icons, manifest
├── middleware.ts               # Route protection
├── vercel.json                 # alias: mohammedcourses.vercel.app
└── package.json
```

---

## DB Schema (all tables prefixed `mrm_`)

### `mrm_admin_settings`
| Column | Type | Notes |
|--------|------|-------|
| key | varchar PK | e.g. `"password"` |
| value | text | bcrypt hash |
| updated_at | timestamp | |

### `mrm_courses`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | varchar(255) | |
| description | text | |
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
| course_id | integer FK → mrm_courses.id | |
| title | varchar(255) | Free-form label |
| meeting_link | text | Auto-generated: `mrm-{random}` — used as Jitsi room name |
| scheduled_at | timestamp | nullable — set by teacher via date+time picker |
| created_at | timestamp | |

### `mrm_students`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(255) | |
| phone | varchar(30) | unique login identifier |
| password_hash | text | bcrypt |
| status | varchar(20) | `pending` / `active` / `blocked` |
| created_at | timestamp | |

### `mrm_enrollments`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| course_id | integer FK → mrm_courses.id | |
| student_id | integer FK → mrm_students.id | |
| payment_ref | varchar(100) | Vodafone Cash receipt (optional) |
| status | varchar(20) | `pending` / `confirmed` / `cancelled` |
| created_at | timestamp | |

### `mrm_materials`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | varchar(255) | |
| description | text | |
| subject | varchar(100) | |
| type | varchar(50) | `link` / `pdf` / `video` |
| url | text | |
| created_at | timestamp | |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home — teacher intro, quick tabs, always-visible student guide |
| `/courses` | Course cards + enrollment form + Vodafone Cash box |
| `/materials` | Study materials filtered by subject |
| `/contact` | WhatsApp + phone (01007050667) |
| `/login` | Student login (phone + password) |
| `/dashboard` | Student dashboard — enrolled courses, sessions, "🎥 دخول الحصة" button |
| `/admin` | Hidden — triple-click logo to reveal password prompt |
| `/admin/courses` | Course CRUD + sessions (date/time picker) + "▶ ابدأ الحصة الآن" Jitsi button |
| `/admin/students` | Student approval/rejection |
| `/admin/enrollments` | View enrollments + payment receipt status |
| `/admin/attendance` | Attendance tracking |
| `/admin/materials` | Material CRUD |
| `/admin/settings` | Admin settings |
| `/api/seed` | GET — runs all migrations + seeds default password |

---

## Key Features

### Live Video Sessions (Jitsi)
- Teacher clicks "▶ ابدأ الحصة الآن" → Jitsi opens fullscreen inside the site
- Student clicks "🎥 دخول الحصة" → same Jitsi room opens fullscreen
- Room name is auto-generated server-side (`mrm-{random}`) — teacher never sees or touches a link
- Jitsi embedded via `JitsiMeetExternalAPI` (External API from `meet.jit.si/external_api.js`)
- `configOverwrite: { prejoinPageEnabled: false }` disables pre-join/lobby
- Teacher shown as "الأستاذ محمد", student shown with their actual name

### Admin auth
- Triple-click logo on any `/admin/*` page → password modal appears
- Token stored in `sessionStorage` — clears on tab close

### Student auth
- Register via course enrollment form → admin approves account
- Login at `/login` → JWT in httpOnly cookie (30-day)
- Dashboard shows only confirmed enrollments and their sessions

### Vodafone Cash enrollment
- When a course has a price: "حوّل X جنيه على فودافون كاش: 01007050667"
- Optional receipt number field (`payment_ref`)

### Guides
- Teacher guide: always visible on admin pages (amber box, non-collapsible)
- Student guide: always visible on home page and dashboard (blue box, non-collapsible)

---

## How to Deploy

Push to GitHub → Vercel auto-deploys (no manual `vercel --prod` needed).

**Required env var (Vercel dashboard):**
- `DATABASE_URL` — Neon PostgreSQL connection string

**After first deploy:** Visit `GET /api/seed` once to create tables and seed the default password.

---

## How to Continue

- **Change admin password:** Update via admin settings or run SQL: `UPDATE mrm_admin_settings SET value = '$2b$...' WHERE key = 'password'`
- **Add a subject:** Update the `SUBJECTS` array in `app/admin/courses/page.tsx`
- **Change phone/WhatsApp:** `app/contact/page.tsx` and `app/courses/page.tsx`
- **DB direct access:** Neon console or `psql $DATABASE_URL`

---

## Audit Status — 2026-07-23 ✓

| Page | Mobile | Desktop | Arabic RTL | Notes |
|------|--------|---------|-----------|-------|
| Home | ✓ | ✓ | ✓ | Always-visible student guide |
| Courses + Enrollment | ✓ | ✓ | ✓ | |
| Materials | ✓ | ✓ | ✓ | |
| Contact | ✓ | ✓ | ✓ | |
| Student Login | ✓ | ✓ | ✓ | |
| Student Dashboard | ✓ | ✓ | ✓ | Jitsi join button |
| Admin — Overview | ✓ | ✓ | ✓ | Teacher guide |
| Admin — Courses + Sessions | ✓ | ✓ | ✓ | Date/time picker + Jitsi start |
| Admin — Students | ✓ | ✓ | ✓ | |
| Admin — Enrollments | ✓ | ✓ | ✓ | |
| Admin — Attendance | ✓ | ✓ | ✓ | |
| Admin — Materials | ✓ | ✓ | ✓ | |
