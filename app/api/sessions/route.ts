import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const courseId = new URL(req.url).searchParams.get("courseId");
    if (!courseId) return NextResponse.json([], { status: 400 });
    const rows = await db.select().from(sessions)
      .where(eq(sessions.courseId, Number(courseId)))
      .orderBy(asc(sessions.scheduledAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { courseId, title, meetingLink, scheduledAt } = await req.json();
    if (!courseId || !title || !meetingLink) {
      return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    }
    const [row] = await db.insert(sessions).values({
      courseId: Number(courseId),
      title,
      meetingLink,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    }).returning();
    return NextResponse.json({ ok: true, data: row });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}
