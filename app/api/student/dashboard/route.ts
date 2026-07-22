import { NextResponse } from "next/server";
import { db } from "@/db";
import { enrollments, courses, sessions, results, materials } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getStudentSession } from "@/lib/auth-student";

export async function GET() {
  const student = await getStudentSession();
  if (!student) return NextResponse.json({ error: "غير مسجّل الدخول" }, { status: 401 });

  // Get approved enrollments linked to this user
  const myEnrollments = await db.select().from(enrollments)
    .where(and(eq(enrollments.userId, student.id), eq(enrollments.status, "approved")));

  const courseIds = myEnrollments.map(e => e.courseId);

  // Get courses + sessions for each enrollment
  const myCourses = await Promise.all(myEnrollments.map(async (enr) => {
    const [course] = await db.select().from(courses).where(eq(courses.id, enr.courseId)).limit(1);
    if (!course) return null;
    const courseSessions = await db.select().from(sessions)
      .where(eq(sessions.courseId, enr.courseId))
      .orderBy(asc(sessions.scheduledAt));
    return { enrollment: enr, course, sessions: courseSessions };
  }));

  // Get results by phone number
  const myResults = await db.select().from(results)
    .where(eq(results.studentCode, student.phone));

  // Get materials for enrolled subjects
  const subjectSet = new Set(myCourses.filter(Boolean).map(c => c!.course.subject));
  const allMaterials = subjectSet.size > 0
    ? await db.select().from(materials)
    : [];
  const myMaterials = allMaterials.filter(m => subjectSet.has(m.subject));

  return NextResponse.json({
    student,
    courses: myCourses.filter(Boolean),
    results: myResults,
    materials: myMaterials,
    courseIds,
  });
}
