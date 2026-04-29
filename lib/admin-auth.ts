import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { systemUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

export function getAdminSecret(): string {
  // Use a secure default for development, but in production this MUST be overridden
  return process.env.ADMIN_SECRET ?? "dps-admin-secure-key-2069-replace-in-prod";
}

const getEncodedSecret = () => new TextEncoder().encode(getAdminSecret());

export async function signToken(payload: { email: string; id: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret());
    return payload as { email: string; id: string };
  } catch {
    return null;
  }
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  
  if (!token) {
    redirect("/admin/login");
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.email) {
    redirect("/admin/login");
  }

  const [user] = await db
    .select()
    .from(systemUsers)
    .where(eq(systemUsers.email, payload.email));

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function verifyAdmin(..._args: unknown[]) {
  void _args;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    console.log("verifyAdmin: token present:", !!token);
    if (!token) return false;

    const payload = await verifyToken(token);
    console.log("verifyAdmin: token valid:", !!payload);
    if (!payload || !payload.email) return false;

    console.log("verifyAdmin: checking DB for user:", payload.email);
    const [user] = await db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.email, payload.email));
    
    console.log("verifyAdmin: user found:", !!user);
    return !!user;
  } catch (error) {
    console.error("verifyAdmin Error:", error);
    return false;
  }
}
