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

/* =====================================================================
   Conținutul unui modul (content/modules/<id>.json)
   strictObject: o cheie scrisă greșit în JSON oprește build-ul.
   ===================================================================== */

/** Trimitere la textul oficial, ex. "Reg. art. 7 lit. k)", "Cod art. 145 alin. (2)", "L407 anexa 1". */
export const RefSchema = z.string().min(1);

/** Text cu **îngroșat**; alte marcaje nu sunt permise. */
const Rich = z.string().min(1).refine((s) => !/<[a-z/]/i.test(s), "fără HTML; folosește **îngroșat**");

export const QuestionSchema = z
  .strictObject({
    q: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    /** indexul variantei corecte, de la 0 */
    answer: z.number().int().min(0),
    explain: z.string(),
    ref: RefSchema,
  })
  .refine((x) => x.answer < x.options.length, { message: "answer în afara variantelor", path: ["answer"] });

const ParagraphSchema = z.strictObject({ text: Rich, refs: z.array(RefSchema).optional() });

const FigureSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("flow"),
    title: z.string(),
    steps: z.array(z.strictObject({ title: z.string(), text: z.string(), ref: RefSchema })).min(2),
  }),
  z.strictObject({
    type: z.literal("grid"),
    title: z.string(),
    items: z.array(z.strictObject({ title: z.string(), text: z.string(), ref: RefSchema })).min(1),
  }),
  z.strictObject({
    type: z.literal("ladder"),
    title: z.string(),
    levels: z.array(z.strictObject({ who: z.string(), does: z.array(z.string()).min(1), ref: RefSchema })).min(2),
  }),
]);

const SectionSchema = z.strictObject({
  title: z.string().min(1),
  paragraphs: z.array(ParagraphSchema).min(1),
  keep: z.array(Rich),
  quiz: z.array(QuestionSchema),
  figure: FigureSchema.optional(),
});

/** Un alineat sau o literă dintr-un articol: [etichetă, text], ex. ["(1)", "…"] sau ["a)", "…"]. */
const ItemSchema = z.tuple([z.string(), z.string()]);

const DocSchema = z.strictObject({
  /** cheia folosită în trimiteri: "Cod", "Reg", "HG", "L407", "NT", "Ghid"… */
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/),
  name: z.string(),
  title: z.string(),
  note: z.string(),
  /** false = documentul apare doar în popover, nu și în fila „Textul oficial” */
  inText: z.boolean(),
  chapters: z.array(z.strictObject({ title: z.string(), from: z.string() })),
  articles: z.array(z.strictObject({ no: z.string(), label: z.string(), items: z.array(ItemSchema) })).min(1),
});

export const ModuleSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  act: z.string(),
  /** forma actului folosită (data la care e la zi) */
  version: z.string(),
  intro: Rich,
  lesson: z.array(SectionSchema).min(1),
  memo: z.array(
    z.strictObject({
      title: z.string(),
      rows: z.array(z.strictObject({ what: z.string(), value: z.string(), ref: RefSchema })).min(1),
    }),
  ),
  tricks: z.array(Rich),
  cards: z.array(z.strictObject({ q: z.string().min(1), a: z.string().min(1), ref: RefSchema })),
  questions: z.array(QuestionSchema).min(1),
  cases: z.array(
    z.strictObject({
      title: z.string(),
      situation: z.string(),
      steps: z.array(z.strictObject({ q: z.string(), a: z.string(), ref: RefSchema })).min(1),
    }),
  ),
  texts: z.strictObject({
    docs: z.array(DocSchema).min(1),
    annexes: z
      .strictObject({
        title: z.string(),
        items: z.array(z.strictObject({ no: z.string(), items: z.array(ItemSchema) })).min(1),
      })
      .optional(),
  }),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Figure = z.infer<typeof FigureSchema>;
export type TextDoc = z.infer<typeof DocSchema>;
export type ModuleContent = z.infer<typeof ModuleSchema>;
