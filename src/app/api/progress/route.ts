import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { auth } from "@/lib/auth";
import { EMPTY, mergeProgress, normalize, ProgressSchema, type Progress } from "@/lib/progress/model";

/*
 * Progresul contului logat.
 * GET: ce e salvat. PUT: trimiți copia din browser; serverul o unește cu ce are
 * (cheie cu cheie, câștigă schimbarea mai nouă), salvează și întoarce rezultatul unit.
 */

async function userId(req: Request) {
  const s = await auth.api.getSession({ headers: req.headers });
  return s?.user.id ?? null;
}

export async function GET(req: Request) {
  const id = await userId(req);
  if (!id) return Response.json({ error: "Nu ești logat." }, { status: 401 });
  const row = await db.query.progress.findFirst({ where: eq(progress.userId, id) });
  return Response.json({ data: row ? normalize(row.data) : EMPTY, updatedAt: row?.updatedAt ?? null });
}

export async function PUT(req: Request) {
  const id = await userId(req);
  if (!id) return Response.json({ error: "Nu ești logat." }, { status: 401 });

  const text = await req.text();
  if (text.length > 2_000_000) return Response.json({ error: "Progres prea mare." }, { status: 413 });
  const parsed = ProgressSchema.safeParse(JSON.parse(text || "null")?.data);
  if (!parsed.success) return Response.json({ error: "Date de progres invalide." }, { status: 400 });

  // Într-o tranzacție, cu rândul blocat: două dispozitive care salvează deodată nu se calcă pe picioare.
  const merged = await db.transaction(async (tx) => {
    const rows = await tx.select().from(progress).where(eq(progress.userId, id)).for("update");
    const next: Progress = mergeProgress(rows[0] ? normalize(rows[0].data) : EMPTY, parsed.data as Progress);
    await tx
      .insert(progress)
      .values({ userId: id, data: next })
      .onConflictDoUpdate({ target: progress.userId, set: { data: next, updatedAt: sql`now()` } });
    return next;
  });
  return Response.json({ data: merged });
}
