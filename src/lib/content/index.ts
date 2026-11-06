import "server-only";
import examJson from "../../../content/exams/inginer-silvic-ds-bacau.json";
import { ExamSchema, type Exam, type Group, type ModuleRef } from "./schema";

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
