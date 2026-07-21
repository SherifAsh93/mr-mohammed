import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { results } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (q) {
      const rows = await db
        .select()
        .from(results)
        .where(or(ilike(results.studentName, `%${q}%`), ilike(results.studentCode, `%${q}%`)))
        .orderBy(desc(results.createdAt));
      return NextResponse.json(rows);
    }
    const rows = await db.select().from(results).orderBy(desc(results.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, studentCode, grade, subject, examName, score, maxScore } = body;
    if (!studentName || !grade || !subject || !examName || score === undefined) {
      return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    }
    const [row] = await db
      .insert(results)
      .values({ studentName, studentCode, grade, subject, examName, score: String(score), maxScore: String(maxScore || 100) })
      .returning();
    return NextResponse.json({ ok: true, data: row });
  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}
