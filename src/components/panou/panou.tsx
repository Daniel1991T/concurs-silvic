"use client";

import Link from "next/link";
import { useContext, useState, type CSSProperties } from "react";
import { CountsContext } from "@/components/shell/progress-context";
import { formatClock, useTimer } from "@/components/shell/timer-mini";
import { Bar } from "@/components/ui/bar";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/ui/stamp";
import { cx } from "@/lib/cx";
import { modulePercent } from "@/lib/progress/stats";
import { deleteSession, setPref, useMinute, useProgress, useToday } from "@/lib/progress/store";
import { activeDays, dayAt, dayKey, formatMinutes, minutesByDay, streak, weekMinutes } from "@/lib/progress/study";

export type PanouModule = { id: string; abbr: string; title: string };

const DEFAULT_GOAL = 120;
const WEEKDAYS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const MONTHS = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];

function Tick() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

/** Panoul: cronometrul, examenul, indicatorii, ce faci azi, timpul pe zile, calendarul, modulele și sesiunile. */
export function Panou({ modules }: { modules: PanouModule[] }) {
  const p = useProgress();
  const today = useToday(); // null la randarea pe server
  const counts = useContext(CountsContext);
  const timer = useTimer();
  const [editExam, setEditExam] = useState(false);

  const now = useMinute(); // null la randarea pe server
  const goal = p.prefs.goal ?? DEFAULT_GOAL;
  const byDay = minutesByDay(p);
  const days = activeDays(p);
  const byId = new Map(modules.map((m) => [m.id, m]));

  // indicatorii
  const week = now ? weekMinutes(byDay, now) : 0;
  const pctAll = Math.round(
    modules.reduce((a, m) => a + (counts[m.id] ? modulePercent(p, m.id, counts[m.id]).pct : 0), 0) / modules.length,
  );
  const answered = Object.values(p.answers).reduce((a, x) => a + x.n, 0);
  const stats = [
    // în ore cu o zecimală, ca să încapă pe un rând în card
    week < 60
      ? { l: "Săptămâna", v: String(Math.round(week)), u: "min" }
      : { l: "Săptămâna", v: (week / 60).toFixed(1).replace(".", ","), u: "ore" },
    { l: "Zile la rând", v: now ? String(streak(days, now)) : "0" },
    { l: "Zile de studiu", v: String(days.size) },
    { l: "% din bibliografie", v: String(pctAll), u: "%" },
    { l: "Grile", v: String(answered) },
  ];

  // examenul
  const exam = p.prefs.exam;
  const examMs = exam ? new Date(`${exam}T09:00:00`).getTime() : null;
  const daysLeft = examMs && now ? Math.max(0, Math.ceil((examMs - now) / 864e5)) : null;
  const firstDay = Math.min(
    ...[...Object.values(p.sessions).map((s) => s.s), ...Object.values(p.t).filter((t) => t > 1e12)],
  );
  const elapsedPct =
    examMs && now && Number.isFinite(firstDay) && examMs > firstDay
      ? Math.min(100, Math.round((100 * (now - firstDay)) / (examMs - firstDay)))
      : 0;

  // „ce faci azi”
  const todayKey = now ? dayKey(now) : "";
  const todayMin = byDay.get(todayKey) ?? 0;
  const lastPos = Object.entries(p.t)
    .filter(([k]) => k.startsWith("pos|"))
    .sort((a, b) => b[1] - a[1])[0];
  const lastMod = lastPos ? byId.get(lastPos[0].slice(4)) : modules[0];
  const lastSec = lastMod ? (p.pos[lastMod.id] ?? 0) : 0;
  const dueByModule = modules
    .map((m) => {
      let due = 0;
      for (let i = 0; i < (counts[m.id]?.cards ?? 0); i++) {
        const c = p.cards[`${m.id}:${i}`];
        if (c && today !== null && c.due <= today) due++;
      }
      return { m, due };
    })
    .sort((a, b) => b.due - a.due);
  const dueTotal = dueByModule.reduce((a, x) => a + x.due, 0);
  const wrong = Object.values(p.answers).filter((a) => a.last === 0).length;
  const todo = [
    lastMod && {
      href: `/modul/${lastMod.id}`,
      text: `${lastMod.title}: secțiunea ${lastSec + 1}`,
      done: !!p.read[`${lastMod.id}:${lastSec}`],
    },
    {
      href: dueTotal ? `/modul/${dueByModule[0].m.id}/carduri` : null,
      text: dueTotal ? `Flashcards: ${dueTotal} de repetat` : "Flashcards: nimic de repetat azi",
      done: dueTotal === 0,
    },
    {
      href: wrong ? "/greseli" : null,
      text: wrong ? `Greșeli: ${wrong} ${wrong === 1 ? "grilă de refăcut" : "grile de refăcut"}` : "Greșeli: niciuna",
      done: wrong === 0,
    },
    {
      href: null,
      text: `Ținta zilei: ${formatMinutes(todayMin)} din ${formatMinutes(goal)}`,
      done: todayMin >= goal,
    },
  ].filter(Boolean) as Array<{ href: string | null; text: string; done: boolean }>;

  // timp pe zile (14 zile)
  const bars = now
    ? Array.from({ length: 14 }, (_, i) => {
        const d = dayAt(now, i - 13);
        return { d, min: byDay.get(dayKey(d.getTime())) ?? 0, today: i === 13 };
      })
    : [];
  const maxMin = Math.max(goal * 1.5, ...bars.map((b) => b.min));
  const top = Math.ceil(maxMin / 60) * 60; // axa urcă din oră în oră
  const ticks = Array.from({ length: top / 60 + 1 }, (_, i) => i * 60).filter(
    (_, i, a) => a.length <= 5 || i % 2 === 0,
  );

  // calendarul: 20 de săptămâni, coloane de luni până duminică
  const heat = now
    ? (() => {
        const monday = dayAt(now, -((new Date(now).getDay() + 6) % 7));
        const start = dayAt(monday.getTime(), -7 * 19);
        return Array.from({ length: 140 }, (_, i) => {
          const d = dayAt(start.getTime(), i);
          const k = dayKey(d.getTime());
          const m = byDay.get(k) ?? 0;
          const future = d.getTime() > now + 36e5 * 12;
          const lvl = m >= goal ? 4 : m >= goal / 2 ? 3 : m >= goal / 4 ? 2 : m > 0 || days.has(k) ? 1 : 0;
          return { k, m, lvl, future, today: k === todayKey, d };
        });
      })()
    : [];

  // timp pe modul, din sesiuni
  const timeByModule = new Map<string, number>();
  for (const s of Object.values(p.sessions)) timeByModule.set(s.m, (timeByModule.get(s.m) ?? 0) + (s.e - s.s) / 60000);

  const sessions = Object.entries(p.sessions)
    .sort((a, b) => b[1].s - a[1].s)
    .slice(0, 8);

  return (
    <>
      <div className="row cols-7-5">
        <section className={cx("card timer-card", timer.running && "is-running")} aria-label="Cronometru">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Cronometru</span>
            <span className="timer-state">
              <i />
              {timer.running ? "Se măsoară" : "Oprit"}
            </span>
          </div>
          <p className="timer-big" role="timer" aria-live="off">
            {formatClock(timer.elapsed)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="accent"
              size="lg"
              className="max-md:flex-1"
              onClick={timer.running ? timer.stop : timer.start}
            >
              {timer.running ? "Stop" : "Start"}
            </Button>
          </div>
        </section>

        <section className="feat contours" aria-label="Numărătoare inversă până la examen">
          <span className="eyebrow text-feat-fg-2">Până la examen</span>
          {exam && !editExam ? (
            <p className="feat__n">
              {daysLeft ?? "–"}
              <small>{daysLeft === 1 ? "zi" : "zile"}</small>
            </p>
          ) : (
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const v = String(new FormData(e.currentTarget).get("exam") ?? "");
                if (/^\d{4}-\d{2}-\d{2}$/.test(v)) setPref("exam", v);
                setEditExam(false);
              }}
            >
              <label className="flex flex-col gap-1 text-sm text-feat-fg-2">
                Data examenului
                <input
                  type="date"
                  name="exam"
                  defaultValue={exam}
                  required
                  className="min-h-11 rounded-md border-[1.5px] border-feat-fg-2 bg-transparent px-3 text-feat-fg [color-scheme:dark]"
                />
              </label>
              <Button type="submit" variant="accent">
                Salvează
              </Button>
            </form>
          )}
          <div>
            {exam && !editExam && (
              <p className="mb-2.5 flex flex-wrap items-center gap-x-3 font-mono text-xs leading-snug tracking-[0.1em] text-feat-fg-2 uppercase">
                {new Date(`${exam}T12:00:00`).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <button
                  type="button"
                  className="min-h-11 cursor-pointer tracking-normal normal-case underline"
                  onClick={() => setEditExam(true)}
                >
                  schimbă data
                </button>
              </p>
            )}
            <Bar value={elapsedPct} size="lg" label="Cât a trecut din perioada de pregătire" />
          </div>
        </section>
      </div>

      <ul className="stats">
        {stats.map((s) => (
          <li key={s.l} className="stat">
            <p className="stat__l">{s.l}</p>
            <p className="stat__v">
              {s.v}
              {s.u && <small>{s.u}</small>}
            </p>
          </li>
        ))}
      </ul>

      <div className="row cols-5-7">
        <section className="card" aria-label="Ce faci azi">
          <div className="card__h">
            <h2>Ce faci azi</h2>
          </div>
          <ul className="todo">
            {todo.map((t) => {
              const inner = (
                <>
                  <span className="todo__box">{t.done && <Tick />}</span>
                  <span className="todo__t">{t.text}</span>
                  <span className="sr-only">{t.done ? " — făcut" : ""}</span>
                </>
              );
              return (
                <li key={t.text} className={cx(t.done && "is-done")}>
                  {t.href ? <Link href={t.href}>{inner}</Link> : <span className="todo__row">{inner}</span>}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card" aria-label="Timp pe zile">
          <div className="card__h">
            <h2>Timp pe zile</h2>
            <label className="flex items-center gap-2 text-sm text-text-2">
              Ținta zilnică
              <select
                value={goal}
                onChange={(e) => setPref("goal", Number(e.target.value))}
                className="min-h-11 rounded-md border-[1.5px] border-ctl bg-surface px-2 text-text"
              >
                {[30, 60, 90, 120, 150, 180, 240].map((v) => (
                  <option key={v} value={v}>
                    {formatMinutes(v)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            className="chart"
            role="img"
            aria-label={`Timp de studiu în ultimele 14 zile, cu ținta de ${formatMinutes(goal)} pe zi`}
          >
            <div className="chart__y" aria-hidden="true">
              {ticks.map((v) => (
                <span key={v} style={{ bottom: `${(100 * v) / top}%` }}>
                  {v === 0 ? "0" : `${v / 60} h`}
                </span>
              ))}
            </div>
            <div className="chart__plot">
              {ticks.slice(1).map((v) => (
                <span key={v} className="chart__grid" style={{ bottom: `${(100 * v) / top}%` }} aria-hidden="true" />
              ))}
              {bars.map((b) => (
                <span
                  key={b.d.getTime()}
                  className={cx("chart__bar", b.min < goal && "is-low", b.min === 0 && "is-zero")}
                  style={{ "--h": ((100 * b.min) / top).toFixed(1) } as CSSProperties}
                  title={`${b.d.getDate()} ${MONTHS[b.d.getMonth()]}: ${formatMinutes(b.min)}`}
                />
              ))}
              <div className="chart__t" style={{ "--t": ((100 * goal) / top).toFixed(1) } as CSSProperties}>
                <span>Ținta</span>
              </div>
            </div>
            <div className="chart__x" aria-hidden="true">
              {bars.map((b) => (
                <span key={b.d.getTime()} className={cx(b.today && "is-today")}>
                  {b.d.getDate()}
                </span>
              ))}
            </div>
          </div>
          <div className="legend">
            <span>
              <i />
              Țintă atinsă
            </span>
            <span>
              <i className="l" />
              Sub țintă
            </span>
            <span>
              <i className="t" />
              Ținta zilnică
            </span>
          </div>
          <p className="mt-3 text-xs text-text-2">Timpul vine din cronometru.</p>
        </section>
      </div>

      <section className="card mb-6" aria-label="Calendar de studiu">
        <div className="card__h">
          <h2>Calendar de studiu</h2>
          <span className="eyebrow">20 de săptămâni</span>
        </div>
        <div className="heatwrap">
          <div className="heat__d" aria-hidden="true">
            <span>L</span>
            <span />
            <span>M</span>
            <span />
            <span>V</span>
            <span />
            <span>D</span>
          </div>
          <div className="heat" role="img" aria-label={`Calendar de studiu: ${days.size} zile active`}>
            {heat.map((c) => (
              <i
                key={c.k}
                className={cx(c.lvl ? `h${c.lvl}` : null, c.future && "is-future", c.today && "is-today")}
                title={`${c.d.getDate()} ${MONTHS[c.d.getMonth()]}: ${c.m ? formatMinutes(c.m) : days.has(c.k) ? "activitate fără cronometru" : "nimic"}`}
              />
            ))}
          </div>
        </div>
        <div className="heat__lg">
          <span>Mai puțin</span>
          <i />
          <i className="h1" />
          <i className="h2" />
          <i className="h3" />
          <i className="h4" />
          <span>Mai mult</span>
        </div>
      </section>

      <div className="row cols-7-5">
        <section className="card" aria-label="Pe module">
          <div className="card__h">
            <h2>Pe module</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Modul</th>
                  <th className="hide-m n">Timp</th>
                  <th className="pl-4">Progres</th>
                  <th className="n">Grile</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => {
                  const c = counts[m.id];
                  const st = c ? modulePercent(p, m.id, c) : { pct: 0, mastered: 0 };
                  const t = timeByModule.get(m.id) ?? 0;
                  return (
                    <tr key={m.id}>
                      <td>
                        <Link href={`/modul/${m.id}`} className="who text-text no-underline hover:text-brand-text">
                          <Stamp abbr={m.abbr} progress={st.pct} size={36} />
                          <span className="max-md:sr-only">{m.title}</span>
                        </Link>
                      </td>
                      <td className="hide-m n">{t ? formatMinutes(t) : "–"}</td>
                      <td className="pl-4">
                        <Bar value={st.pct} label={`${m.title}: ${st.pct}%`} />
                      </td>
                      <td className="n">{c?.questions ? `${Math.round((100 * st.mastered) / c.questions)}%` : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-text-2">Grile = cât la sută din grilele de test ai la zi corect.</p>
        </section>

        <section className="card" aria-label="Sesiuni">
          <div className="card__h">
            <h2>Sesiuni</h2>
          </div>
          {sessions.length === 0 ? (
            <p className="text-text-2">
              Încă nicio sesiune. Pornește cronometrul din antet când te apuci de învățat; sesiunile de peste un minut
              apar aici.
            </p>
          ) : (
            <ul className="sess">
              {sessions.map(([id, s]) => {
                const d = new Date(s.s);
                const m = byId.get(s.m);
                return (
                  <li key={id}>
                    <span className="min-w-0">
                      <b className="font-semibold">
                        {WEEKDAYS[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]}
                      </b>
                      <small>
                        {m ? m.title : "General"} ·{" "}
                        {d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </small>
                    </span>
                    <span className="t">{formatMinutes((s.e - s.s) / 60000)}</span>
                    <button
                      type="button"
                      className="grid size-11 cursor-pointer place-items-center rounded-md text-xl text-text-2 hover:bg-surface-2 hover:text-err"
                      aria-label={`Șterge sesiunea din ${d.getDate()} ${MONTHS[d.getMonth()]}`}
                      onClick={() => deleteSession(id)}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
