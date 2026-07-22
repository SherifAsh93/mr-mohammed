import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const sessionId = new URL(req.url).searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json([], { status: 400 });

    // Get all approved enrollments for the session's course
    const session = await db.execute(
      sql`SELECT course_id FROM mrm_sessions WHERE id = ${Number(sessionId)} LIMIT 1`
    );
    const courseId = (session.rows[0] as { course_id: number })?.course_id;
    if (!courseId) return NextResponse.json([]);

    const courseEnrollments = await db.select().from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.status, "approved")));

    const sessionAttendance = await db.select().from(attendance)
      .where(eq(attendance.sessionId, Number(sessionId)));

    const attMap = Object.fromEntries(sessionAttendance.map(a => [a.enrollmentId, a.status]));

    return NextResponse.json(courseEnrollments.map(e => ({
      enrollmentId: e.id,
      studentName: e.studentName,
      studentPhone: e.studentPhone,
      attendanceStatus: attMap[e.id] || "absent",
    })));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, records } = await req.json();
    // records: [{ enrollmentId, status }]
    for (const r of records) {
      await db.execute(sql`
        INSERT INTO mrm_attendance (session_id, enrollment_id, status)
        VALUES (${sessionId}, ${r.enrollmentId}, ${r.status})
        ON CONFLICT (session_id, enrollment_id)
        DO UPDATE SET status = EXCLUDED.status
      `);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
