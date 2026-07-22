import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signStudentToken, studentCookieOptions } from "@/lib/auth-student";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password } = await req.json();
    if (!name || !phone || !password) {
      return NextResponse.json({ ok: false, error: "جميع الحقول مطلوبة" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "كلمة المرور 6 أحرف على الأقل" }, { status: 400 });
    }
    const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existing.length) {
      return NextResponse.json({ ok: false, error: "رقم الهاتف مسجّل بالفعل" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({ name, phone, passwordHash }).returning();
    const token = await signStudentToken({ id: user.id, name: user.name, phone: user.phone });
    const jar = await cookies();
    jar.set(studentCookieOptions(token));
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}
