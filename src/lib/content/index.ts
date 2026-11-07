import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import examJson from "../../../content/exams/inginer-silvic-ds-bacau.json";
import { ExamSchema, type Exam, type Group, type ModuleContent, type ModuleRef } from "./schema";
import { validateModule } from "./validate";

/*
 * Singurul loc din aplicație care citește conținutul.
 * Acum vine din fișiere JSON din repo; dacă mai târziu îl mutăm într-o bază
 * de date, se schimbă doar acest fișier, nu și paginile.
 */

// Validat o singură dată, la build: un JSON greșit oprește build-ul.
const exam: Exam = ExamSchema.parse(examJson);

export function getExam(): Exam {
  return exam;
}

export function getModuleRef(id: string): ModuleRef | undefined {
  return exam.modules.find((m) => m.id === id);
}

export function getGroup(id: string | undefined): Group | undefined {
  return id ? exam.groups.find((g) => g.id === id) : undefined;
}

const MODULES_DIR = path.join(process.cwd(), "content", "modules");
const cache = new Map<string, ModuleContent>();

/**
 * Conținutul complet al unui modul. Aruncă o eroare (deci oprește build-ul)
 * dacă JSON-ul nu respectă schema sau dacă o trimitere nu duce la niciun articol.
 */
export function getModule(id: string): ModuleContent {
  const hit = cache.get(id);
  if (hit) return hit;
  const ref = getModuleRef(id);
  if (!ref || ref.status !== "ready") throw new Error(`Modulul „${id}” nu e în bibliografie sau nu are conținut.`);
  const json: unknown = JSON.parse(readFileSync(path.join(MODULES_DIR, `${id}.json`), "utf8"));
  const { module, errors } = validateModule(json, id);
  if (!module || errors.length) {
    throw new Error(`content/modules/${id}.json are ${errors.length} probleme:\n  - ${errors.join("\n  - ")}`);
  }
  cache.set(id, module);
  return module;
}

/** Câte secțiuni, carduri și grile are fiecare modul cu conținut (pentru procentele de progres). */
export function getModuleCounts(): Record<string, { lesson: number; cards: number; questions: number }> {
  const out: Record<string, { lesson: number; cards: number; questions: number }> = {};
  for (const r of exam.modules) {
    if (r.status !== "ready") continue;
    const m = getModule(r.id);
    out[r.id] = { lesson: m.lesson.length, cards: m.cards.length, questions: m.questions.length };
  }
  return out;
}

/** O grilă de test, în forma scurtă trimisă browserului pentru Simulare și Greșeli. */
export type QuestionLite = { m: string; i: number; q: string; o: string[]; a: number; e: string; r: string };

/** Toate grilele de test din modulele cu conținut (pentru Simulare și Greșeli). */
export function getAllQuestions(): QuestionLite[] {
  return exam.modules
    .filter((r) => r.status === "ready")
    .flatMap((r) =>
      getModule(r.id).questions.map((q, i) => ({
        m: r.id,
        i,
        q: q.q,
        o: q.options,
        a: q.answer,
        e: q.explain,
        r: q.ref,
      })),
    );
}

/** Rândurile din bara laterală: module simple și grupuri pliabile, în ordinea bibliografiei. */
export type SideEntry =
  | { kind: "module"; module: ModuleRef }
  | { kind: "group"; group: Group; modules: ModuleRef[] };

export function getSideEntries(): SideEntry[] {
  const out: SideEntry[] = [];
  const seen = new Set<string>();
  for (const m of exam.modules) {
    if (!m.group) {
      out.push({ kind: "module", module: m });
      continue;
    }
    if (seen.has(m.group)) continue;
    seen.add(m.group);
    const group = getGroup(m.group)!;
    out.push({ kind: "group", group, modules: exam.modules.filter((x) => x.group === m.group) });
  }
  return out;
}
