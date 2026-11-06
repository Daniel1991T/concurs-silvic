import { z } from "zod";

/** Un modul din bibliografie (un act normativ sau o parte dintr-unul). */
export const ModuleRefSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  act: z.string().min(1),
  abbr: z.string().min(1).max(4),
  /** "ready" = are conținut; "missing" = textul actului lipsește încă */
  status: z.enum(["ready", "missing"]),
  /** id-ul grupului pliabil din bara laterală (ex. "cs" pentru Codul silvic) */
  group: z.string().optional(),
});

export const GroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  act: z.string(),
  abbr: z.string().max(4),
});

/** Un concurs = o bibliografie, adică lista lui ordonată de module. */
export const ExamSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string(),
    groups: z.array(GroupSchema),
    modules: z.array(ModuleRefSchema).min(1),
  })
  .superRefine((exam, ctx) => {
    const ids = new Set<string>();
    const groups = new Set(exam.groups.map((g) => g.id));
    exam.modules.forEach((m, i) => {
      if (ids.has(m.id)) ctx.addIssue({ code: "custom", path: ["modules", i, "id"], message: `id dublat: ${m.id}` });
      ids.add(m.id);
      if (m.group && !groups.has(m.group))
        ctx.addIssue({ code: "custom", path: ["modules", i, "group"], message: `grup inexistent: ${m.group}` });
    });
  });

export type ModuleRef = z.infer<typeof ModuleRefSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Exam = z.infer<typeof ExamSchema>;
