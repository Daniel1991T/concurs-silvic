"use client";

import { createAuthClient } from "better-auth/react";

/** Clientul de autentificare din browser: login, cont nou, ieșire, sesiunea curentă. */
export const authClient = createAuthClient();
export const { useSession, signIn, signUp, signOut } = authClient;
