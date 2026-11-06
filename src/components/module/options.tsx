"use client";

const KEYS = "ABCDEF";

function Tick() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}
function Cross() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

/**
 * Variantele unei grile. Înainte de răspuns sunt butoane; după, varianta corectă
 * apare albastră cu bifă și „Corect”, iar cea aleasă greșit vișinie, cu x, „Greșit” și text tăiat.
 */
export function Options({
  options,
  answer,
  picked,
  onPick,
  compact,
}: {
  options: string[];
  answer: number;
  /** varianta aleasă; null = încă nu s-a răspuns */
  picked: number | null;
  onPick: (i: number) => void;
  compact?: boolean;
}) {
  const done = picked !== null;
  return (
    <div className={`opts${compact ? " is-compact" : ""}`} role="group" aria-label="Variante de răspuns">
      {options.map((o, i) => {
        const ok = done && i === answer;
        const err = done && i === picked && i !== answer;
        return (
          <button
            key={i}
            type="button"
            className={`opt${ok ? " is-ok" : ""}${err ? " is-err" : ""}`}
            disabled={done}
            onClick={() => onPick(i)}
            aria-label={ok ? `${o} — varianta corectă` : err ? `${o} — varianta aleasă, greșită` : undefined}
          >
            <span className="opt__k">{KEYS[i]}</span>
            <span className="opt__t">{o}</span>
            {ok ? (
              <span className="opt__s">
                <Tick />
                Corect
              </span>
            ) : err ? (
              <span className="opt__s">
                <Cross />
                Greșit
              </span>
            ) : (
              <span />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Caseta cu explicația după răspuns. */
export function Feedback({ ok, explain, children }: { ok: boolean; explain: string; children?: React.ReactNode }) {
  return (
    <div className={`fb${ok ? " is-ok" : ""}`} role="status">
      <h3>
        {ok ? <Tick /> : <Cross />}
        {ok ? "Corect" : "Greșit"}
      </h3>
      {explain && <p>{explain}</p>}
      {children}
    </div>
  );
}
