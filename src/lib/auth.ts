import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "@/db/schema";
import { env } from "./env";

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  pages: { signIn: "/auth/login" },
  providers: [
    Credentials({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const parsed = credSchema.safeParse(creds);
        if (!parsed.success) return null;
        const u = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email.toLowerCase()),
        });
        if (!u || !u.passwordHash) return null;
        const ok = await bcrypt.compare(parsed.data.password, u.passwordHash);
        if (!ok) return null;
        return {
          id: u.id,
          email: u.email,
          name: u.displayName ?? null,
          role: u.role,
        } as { id: string; email: string; name: string | null; role: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
        token.uid = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "user" | "admin";
};

export async function requireUser(): Promise<SessionUser> {
  const s = await auth();
  if (!s?.user) throw new Error("unauthenticated");
  return s.user as unknown as SessionUser;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== "admin") throw new Error("forbidden");
  return u;
}
