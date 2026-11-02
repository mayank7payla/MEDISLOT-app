import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export type SessionUser = { id: string; name: string; email: string; role: "PATIENT" | "DOCTOR" | "ADMIN" };

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c?.password) return null;
        const u = await prisma.user.findUnique({ where: { email: c.email.toLowerCase() } });
        if (!u || !(await bcrypt.compare(c.password, u.password))) return null;
        return { id: u.id, name: u.name, email: u.email, role: u.role } as any;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role; }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      return session;
    },
  },
};

export async function currentUser() {
  const s = await getServerSession(authOptions);
  return s?.user as SessionUser | undefined;
}
