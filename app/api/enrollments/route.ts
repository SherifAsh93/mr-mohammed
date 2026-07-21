import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const query = db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
    if (courseId) {
      const rows = await db.select().from(enrollments)
        .where(eq(enrollments.courseId, Number(courseId)))
        .orderBy(desc(enrollments.createdAt));
      return NextResponse.json(rows);
    }
    const rows = await query;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, studentName, studentPhone, studentEmail } = body;
    if (!courseId || !studentName || !studentPhone) {
      return NextResponse.json({ ok: false, error: "الاسم ورقم الهاتف مطلوبان" }, { status: 400 });
    }
    const [row] = await db.insert(enrollments).values({
      courseId: Number(courseId), studentName, studentPhone, studentEmail,
      status: "pending",
    }).returning();
    return NextResponse.json({ ok: true, data: row });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}
