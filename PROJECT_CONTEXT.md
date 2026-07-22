# Mr. Mohammed — PROJECT_CONTEXT

## What It Does

Full Udemy-style learning platform for an Arabic & Islamic Studies teacher. Students create accounts with phone + password, enroll in courses, and access live sessions + recordings from their personal dashboard. Teacher manages everything via a hidden admin panel.

**Live URL:** https://mohammedcourses.vercel.app  
**GitHub:** https://github.com/SherifAsh93/mr-mohammed  
**Local:** `/home/sherif/sites/mr-mohammed`  
**Stack:** Next.js 16.2.10 (Turbopack) · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · bcryptjs · jose (JWT)  
**Deploy:** Vercel CLI (`vercel --prod`) — `vercel.json` aliases to `mohammedcourses.vercel.app`  
**Admin access:** Triple-click the logo → password: `123456` (stored in `sessionStorage`)  
**Student auth:** Phone + password → JWT in httpOnly cookie `student_token` (30-day)  
**Video storage:** Cloudinary (cloud: `dzppk5ylt`, preset: `mr_mohammed_videos`, unsigned) — direct browser upload with progress bar

---

## Structure

```
mr-mohammed/
├── app/
│   ├── layout.tsx              # Root layout — Cairo font, RTL, PWA meta
│   ├── page.tsx                # Home page — teacher intro + CTA
│   ├── globals.css             # Tailwind + glass effects + slide-up animation
│   ├── courses/page.tsx        # Course listing + enrollment bottom sheet + Vodafone Cash box
│   ├── materials/page.tsx      # Study materials by subject
│   ├── results/page.tsx        # Student result lookup by name/code
│   ├── contact/page.tsx        # WhatsApp + phone links (01007050667)
│   ├── admin/
│   │   ├── layout.tsx          # Admin shell — triple-click logo auth guard
│   │   ├── page.tsx            # Admin dashboard overview
│   │   ├── courses/page.tsx    # Courses CRUD + per-session meeting links panel
│   │   ├── enrollments/page.tsx# Enrollment viewer + payment receipt status
│   │   ├── materials/page.tsx  # Materials CRUD
│   │   └── results/page.tsx    # Student results CRUD
│   └── api/
│       ├── seed/route.ts       # DB migration + seed (run once via GET /api/seed)
│       ├── auth/route.ts       # POST — bcrypt password check → token
│       ├── courses/
│       │   ├── route.ts        # GET all / POST new
│       │   └── [id]/route.ts   # PUT / DELETE
│       ├── sessions/
│       │   ├── route.ts        # GET ?courseId=X / POST new session
│       │   └── [id]/route.ts   # DELETE
│       ├── enrollments/
│       │   ├── route.ts        # GET all / POST new enrollment
│       │   └── [id]/route.ts   # PATCH status / DELETE
│       ├── materials/
│       │   ├── route.ts        # GET all / POST new
│       │   └── [id]/route.ts   # PUT / DELETE
│       └── results/
│           ├── route.ts        # GET all / POST new
│           └── [id]/route.ts   # PUT / DELETE
├── components/
│   ├── Header.tsx              # Back-arrow header with title
│   └── BottomNav.tsx           # PWA bottom navigation (4 tabs)
├── db/
│   ├── schema.ts               # All 6 tables (all prefixed mrm_)
│   └── index.ts                # Neon + Drizzle client
├── public/                     # PWA icons, manifest
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
| price | decimal(10,2) | nullable — shown in enrollment form |
| created_at | timestamp | |

### `mrm_sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| course_id | integer FK → mrm_courses.id | |
| title | varchar(255) | Free-form label (e.g. "الحصة الأولى", date, topic) |
| meeting_link | text | Teams / Zoom / Meet URL |
| created_at | timestamp | |

### `mrm_enrollments`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| course_id | integer FK → mrm_courses.id | |
| student_name | varchar(255) | |
| student_phone | varchar(30) | |
| student_email | varchar(255) | nullable |
| payment_ref | varchar(100) | Vodafone Cash receipt number (optional) |
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

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home — teacher intro, subject badges, CTA buttons |
| `/courses` | Course cards + enrollment bottom sheet |
| `/materials` | Study materials filtered by subject |
| `/results` | Student grade lookup |
| `/contact` | WhatsApp + phone (01007050667) |
| `/admin` | Hidden — triple-click logo to reveal password prompt |
| `/admin/courses` | Course CRUD + per-session meeting links |
| `/admin/enrollments` | View enrollments + payment receipt status |
| `/admin/materials` | Material CRUD |
| `/admin/results` | Student result CRUD |
| `/api/seed` | GET — runs all migrations + seeds default password |

---

## Key Features

### Admin auth
- Triple-click logo on any `/admin/*` page → password modal appears
- `useRef` counter avoids stale closure on click
- Token stored in `sessionStorage` — clears on tab close

### Vodafone Cash enrollment
- When a course has a price, the enrollment form shows the amount prominently: "حوّل X جنيه على فودافون كاش: 01007050667"
- Optional receipt number field (`payment_ref`) — admin sees green "💳 إيصال: [number]" or amber "لم يُرسل إيصال بعد"

### Per-session meeting links
- No fixed link per course — teacher adds free-form sessions (any label + any URL)
- Admin clicks "📎 الحصص" on any course → inline panel to add/copy/delete session links
- Copy button shows "تم النسخ ✓" for 2 seconds

---

## How to Deploy

```bash
cd /home/sherif/sites/mr-mohammed
vercel --prod
```

**Required env var (Vercel dashboard):**
- `DATABASE_URL` — Neon PostgreSQL connection string

**After first deploy:** Visit `GET /api/seed` once to create tables and seed the default password.

---

## How to Continue

- **Change admin password:** Go to `/api/seed` or run `UPDATE mrm_admin_settings SET value = '$2b$...' WHERE key = 'password'`
- **Add a subject:** Update the `SUBJECTS` array in `app/admin/courses/page.tsx`
- **Change phone/WhatsApp:** `app/contact/page.tsx` and `app/courses/page.tsx` (Vodafone Cash box)
- **Change Vodafone Cash number:** Search for `01007050667` — appears in `contact/page.tsx` and `courses/page.tsx`
- **DB direct access:** Neon console or `psql $DATABASE_URL`

---

## Audit Status — 2026-07-21 ✓

| Page | Mobile | Arabic RTL | Admin |
|------|--------|-----------|-------|
| Home | ✓ | ✓ | — |
| Courses + Enrollment | ✓ | ✓ | ✓ |
| Materials | ✓ | ✓ | ✓ |
| Results | ✓ | ✓ | ✓ |
| Contact | ✓ | ✓ | — |
| Admin — Courses + Sessions | ✓ | ✓ | ✓ |
| Admin — Enrollments | ✓ | ✓ | ✓ |
| Admin — Materials | ✓ | ✓ | ✓ |
| Admin — Results | ✓ | ✓ | ✓ |
