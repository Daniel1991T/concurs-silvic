# Concurs Inginer Silvic

Aplicație de studiu pentru concursul Romsilva de inginer silvic (bibliografia DS Bacău):
lecții, fișe de memorat, flashcards, situații din teren, teste și textul oficial al actelor.

## Pornire

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # verifică tipurile și conținutul, generează paginile
npm run lint
npm run check:content   # verifică tot conținutul și toate trimiterile, cu lista completă de probleme
```

## Structură

- `content/` — conținutul, în JSON: `exams/` (concursul și lista lui de module), `modules/` (un fișier pe modul).
  Fișierele se validează cu Zod la build; o greșeală oprește build-ul.
- `src/lib/content/` — singurul loc care citește conținutul (`getExam()`, `getModule()`…), schema (`schema.ts`)
  și trimiterile la textul oficial (`refs.ts`).
- `scripts/check-content.ts` — verificarea completă a conținutului.
- `src/app/globals.css` — sistemul de design „Carnet de teren”: culorile (mod luminos și întunecat),
  fonturile și scara tipografică, legate de Tailwind.
- `src/components/shell/` — antetul, navigarea, cronometrul, bara laterală și sertarul de pe telefon.
- `src/components/ui/` — componente: `Stamp`, `Bar`, `Button`, `PageHead`.

## Etape

1. Schelet și design ✔
2. Conținutul în JSON (+ conversia modulelor existente) ✔
3. Ecranele modulului
4. Conturi și baza de date (Better Auth, Neon, Drizzle)
5. Panou, Simulare, Greșeli
6. PWA, offline, publicare pe Vercel

## Formatul unui modul (`content/modules/<id>.json`)

| Câmp | Ce conține |
|---|---|
| `id`, `title`, `act`, `version`, `intro` | identitatea modulului și forma actului folosită |
| `lesson[]` | secțiuni: `title`, `paragraphs[]` (`text` + `refs[]`), `keep[]` (De reținut), `quiz[]`, `figure` (`flow` / `grid` / `ladder`) |
| `memo[]` | fișa de memorat: tabele cu rânduri `{ what, value, ref }` |
| `tricks[]` | trucuri de memorare |
| `cards[]` | flashcards `{ q, a, ref }` |
| `questions[]` | testul: `{ q, options[], answer, explain, ref }` (`answer` = indexul variantei corecte, de la 0) |
| `cases[]` | situații din teren: `{ title, situation, steps[] }` |
| `texts` | textul oficial: `docs[]` (cheie, titlu, capitole, articole cu alineate/litere) și `annexes` |

În texte, `**așa**` înseamnă îngroșat. Trimiterile (`ref`, `refs`) au forma folosită în lecții:
`Reg. art. 7 lit. k)`, `Cod art. 145 alin. (2)`, `L407 anexa 1`, `Ghid pct. 3.3`, `NT Anexa 2`.
Fiecare trebuie să ducă la un articol existent în `texts`, altfel build-ul se oprește.
