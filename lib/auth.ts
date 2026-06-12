import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db";
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from "@/lib/db/schema";

import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];

// Magic link במייל (פרודקשן) — דורש AUTH_RESEND_KEY
if (process.env.AUTH_RESEND_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM || "InstaPilot <onboarding@resend.dev>",
    })
  );
}

// כניסת פיתוח — סיסמה יחידה מ-env (משתמש יחיד)
if (process.env.AUTH_DEV_PASSWORD) {
  providers.push(
    Credentials({
      id: "dev",
      name: "כניסת פיתוח",
      credentials: { password: { label: "סיסמה", type: "password" } },
      authorize: async (credentials) => {
        if (credentials?.password === process.env.AUTH_DEV_PASSWORD) {
          return { id: "dev-user", email: "dev@instapilot.local", name: "מנהל" };
        }
        return null;
      },
    })
  );
}

// קונפיגורציה עצלה — נבנית רק בזמן request, כדי שה-build יעבור גם בלי DATABASE_URL
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
  callbacks: {
    authorized: ({ auth }) => !!auth?.user,
  },
}));
