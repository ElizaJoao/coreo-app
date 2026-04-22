import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import { verifyUserCredentials } from "./lib/auth-store";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        const user = await verifyUserCredentials(email, password);
        if (!user) return null;

        return { id: user.id, email: user.email, name: user.name, plan: user.plan };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.name) token.name = user.name;
      if ((user as { plan?: string })?.plan) token.plan = (user as { plan?: string }).plan;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.sub === "string") session.user.id = token.sub;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.plan === "string") (session.user as { plan?: string }).plan = token.plan;
      }
      return session;
    },
  },
});

