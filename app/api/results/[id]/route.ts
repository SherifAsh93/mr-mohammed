import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { results } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { studentName, studentCode, grade, subject, examName, score, maxScore } = body;
    await db.update(results).set({
      studentName, studentCode, grade, subject, examName,
      score: String(score), maxScore: String(maxScore || 100),
    }).where(eq(results.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(results).where(eq(results.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
