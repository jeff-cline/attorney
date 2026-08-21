import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "@/db/schema";
import { env } from "./env";
import { getImpersonatedUserId } from "./impersonation";

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
          mustChangePassword: u.mustChangePassword,
        } as { id: string; email: string; name: string | null; role: string; mustChangePassword: boolean };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
        token.uid = (user as { id?: string }).id;
        token.mustChange = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { mustChangePassword?: boolean }).mustChangePassword = Boolean(token.mustChange);
        // God-mode impersonation: honored ONLY when the real user is an admin.
        if (token.role === "admin") {
          const impUid = await getImpersonatedUserId();
          if (impUid && impUid !== token.uid) {
            const target = await db.query.users.findFirst({ where: eq(users.id, impUid) });
            if (target) {
              const su = session.user as unknown as Record<string, unknown>;
              su.id = target.id;
              su.email = target.email;
              su.name = target.displayName ?? null;
              su.role = target.role;
              su.impersonating = true;
              su.impersonatorId = token.uid;
              su.impersonatorEmail = session.user.email ?? null;
            }
          }
        }
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
