# Mr. Mohammed — Online Teaching Platform

Arabic language and Islamic Studies teacher website. Students register, enroll in courses, pay via Vodafone Cash, and join live video sessions directly in the browser via Jitsi Meet.

**Live:** https://mohammedcourses.vercel.app  
**Stack:** Next.js 16.2.10 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Drizzle ORM · Jitsi Meet  
**Deployment:** Vercel (auto-deploy on push to `main`)

---

## Quick Start

```bash
npm install
# Create .env.local with DATABASE_URL and STUDENT_JWT_SECRET
npm run dev
# Visit http://localhost:3000/api/seed once to init the database
```

## Admin Access

Triple-click the logo on any page → enter password → admin panel at `/admin`.

## Environment Variables

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes — Neon PostgreSQL connection string |
| `STUDENT_JWT_SECRET` | Yes — JWT signing secret for student sessions |
| `NEXT_PUBLIC_SITE_URL` | No — canonical URL for OG metadata |

## Structure

```
app/          # Next.js App Router pages + API routes
components/   # Header, AdminTrigger, BottomNav, JitsiSession
db/           # Drizzle schema + Neon client
lib/          # Student JWT auth helpers
public/       # PWA icons + manifest
middleware.ts # Protects /dashboard route
```

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for full documentation.
