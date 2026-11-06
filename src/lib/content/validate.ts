import { buildTextIndex, collectRefs, resolveRef } from "./refs";
import { ModuleSchema, type ModuleContent } from "./schema";

/*
 * Verificarea unui modul: forma JSON-ului (Zod) și faptul că fiecare trimitere
 * duce la un articol existent în textul oficial. Fără dependențe de Next,
 * ca să poată rula și din scripts/check-content.ts.
 */

export type ValidationResult = { module?: ModuleContent; errors: string[]; refCount: number };

export function validateModule(json: unknown, expectedId: string): ValidationResult {
  const parsed = ModuleSchema.safeParse(json);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(rădăcină)"}: ${i.message}`),
      refCount: 0,
    };
  }
  const m = parsed.data;
  const errors: string[] = [];
  if (m.id !== expectedId) errors.push(`id-ul din fișier („${m.id}”) diferă de numele fișierului („${expectedId}”)`);

  const idx = buildTextIndex(m.texts);
  const refs = collectRefs(m);
  for (const { ref, where } of refs) {
    if (resolveRef(ref, idx).length === 0) errors.push(`trimitere fără articol: „${ref}” (${where})`);
  }
  return { module: m, errors, refCount: refs.length };
}
