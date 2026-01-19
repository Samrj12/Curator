import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { saveOrUpdateUser } from "@/lib/firebaseAdmin";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth credentials");
}

if (!nextAuthSecret) {
  throw new Error("Missing NEXTAUTH_SECRET");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.id || !user.email || !user.name) {
          return false;
        }
        await saveOrUpdateUser({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || undefined,
        });
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
