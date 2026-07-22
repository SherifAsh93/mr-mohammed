import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearStudentCookie } from "@/lib/auth-student";

export async function POST() {
  const jar = await cookies();
  jar.set(clearStudentCookie());
  return NextResponse.json({ ok: true });
}
