import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, enrollments, courses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allEnrollments = await db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
    const allCourses = await db.select().from(courses);

    const courseMap = Object.fromEntries(allCourses.map(c => [c.id, c]));

    const result = allUsers.map(u => ({
      ...u,
      enrollments: allEnrollments
        .filter(e => e.userId === u.id)
        .map(e => ({ ...e, course: courseMap[e.courseId] || null })),
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
