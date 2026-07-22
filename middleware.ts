import { NextRequest, NextResponse } from "next/server";
import { verifyStudentToken } from "@/lib/auth-student";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("student_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  const user = await verifyStudentToken(token);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard"] };
