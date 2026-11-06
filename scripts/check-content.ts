/*
 * Verifică tot conținutul: bibliografia, fiecare modul (forma JSON-ului) și
 * fiecare trimitere la textul oficial. Rulează cu:  npm run check:content
 * Spre deosebire de build, care se oprește la primul modul greșit, aici vezi toate problemele odată.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ExamSchema } from "../src/lib/content/schema";
import { validateModule } from "../src/lib/content/validate";

const root = path.join(import.meta.dirname, "..", "content");
let problems = 0;
let refs = 0;

for (const file of readdirSync(path.join(root, "exams")).filter((f) => f.endsWith(".json"))) {
  const exam = ExamSchema.safeParse(JSON.parse(readFileSync(path.join(root, "exams", file), "utf8")));
  if (!exam.success) {
    problems += exam.error.issues.length;
    console.error(`✗ exams/${file}`);
    exam.error.issues.forEach((i) => console.error(`    ${i.path.join(".")}: ${i.message}`));
    continue;
  }
  for (const m of exam.data.modules.filter((x) => x.status === "ready")) {
    const p = path.join(root, "modules", `${m.id}.json`);
    if (!existsSync(p)) {
      problems++;
      console.error(`✗ ${m.id}: modulul e „ready” în exams/${file}, dar lipsește content/modules/${m.id}.json`);
    }
  }
}

for (const file of readdirSync(path.join(root, "modules"))
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const id = file.replace(/\.json$/, "");
  const r = validateModule(JSON.parse(readFileSync(path.join(root, "modules", file), "utf8")), id);
  refs += r.refCount;
  if (r.errors.length) {
    problems += r.errors.length;
    console.error(`✗ ${id}`);
    r.errors.forEach((e) => console.error(`    ${e}`));
  } else {
    const m = r.module!;
    console.log(
      `✓ ${id.padEnd(11)} ${String(m.lesson.length).padStart(2)} secțiuni · ${String(m.cards.length).padStart(3)} carduri · ` +
        `${String(m.questions.length).padStart(3)} grile · ${r.refCount} trimiteri`,
    );
  }
}

console.log(`\n${refs} trimiteri verificate, ${problems} probleme.`);
process.exit(problems ? 1 : 0);
