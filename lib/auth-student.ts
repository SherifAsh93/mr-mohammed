import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.STUDENT_JWT_SECRET || "fallback-dev-secret-change-in-prod");
const COOKIE = "student_token";
const EXPIRY = "30d";

export type StudentPayload = { id: number; name: string; phone: string };

export async function signStudentToken(payload: StudentPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyStudentToken(token: string): Promise<StudentPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as StudentPayload;
  } catch {
    return null;
  }
}

export async function getStudentSession(): Promise<StudentPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyStudentToken(token);
}

export function studentCookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function clearStudentCookie() {
  return { name: COOKIE, value: "", maxAge: 0, path: "/" };
}
