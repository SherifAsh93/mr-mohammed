import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(courses).orderBy(desc(courses.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, subject, scheduleText, status, maxStudents, meetingLink } = body;
    if (!title || !subject) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    const [row] = await db.insert(courses).values({
      title, description, subject,
      scheduleText, status: status || "open",
      maxStudents: maxStudents || 0,
      meetingLink,
    }).returning();
    return NextResponse.json({ ok: true, data: row });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}
