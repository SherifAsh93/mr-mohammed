import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signStudentToken, studentCookieOptions } from "@/lib/auth-student";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ ok: false, error: "رقم الهاتف وكلمة المرور مطلوبان" }, { status: 400 });
    }
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user) {
      return NextResponse.json({ ok: false, error: "رقم الهاتف أو كلمة المرور غير صحيحة" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "رقم الهاتف أو كلمة المرور غير صحيحة" }, { status: 401 });
    }
    const token = await signStudentToken({ id: user.id, name: user.name, phone: user.phone });
    const jar = await cookies();
    jar.set(studentCookieOptions(token));
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "حدث خطأ" }, { status: 500 });
  }
}
