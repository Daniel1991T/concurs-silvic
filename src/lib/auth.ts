import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

/*
 * Conturile: email + parolă, prin Better Auth.
 * Sesiunea de login stă într-un cookie; datele (conturi, sesiuni) în Postgres.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // după ce ți-ai făcut contul, DISABLE_SIGNUP=true oprește crearea altor conturi
    disableSignUp: process.env.DISABLE_SIGNUP === "true",
  },
  session: {
    // rămâi logat 60 de zile; sesiunea se prelungește singură când folosești aplicația
    expiresIn: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24,
  },
  plugins: [nextCookies()],
});
