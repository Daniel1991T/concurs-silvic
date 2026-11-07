import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/*
 * Conexiunea la Postgres (Neon în producție, orice Postgres local în dezvoltare).
 * Adresa vine din DATABASE_URL, în .env.local. Conexiunea se deschide abia la prima interogare.
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

export const db = drizzle(pool, { schema });
