import { Fragment } from "react";

/** Text cu **îngroșat** (singurul marcaj permis în conținut). */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}</>;
}

/**
 * Un alineat sau o literă din textul legii. Etichetele scurte („(1)”, „a)”) stau în
 * marginea din stânga; cele lungi („Rezumat”, „Bizamul (…)”) sunt scrise îngroșat în fața textului.
 */
export function LawItem({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  const hi = highlight ? " is-hi" : "";
  if (!label) return <p className={`alin pl-0!${hi}`}>{text}</p>;
  if (label.length <= 7) {
    const isLit = /^[a-zăâîșț]{1,3}[¹²³⁴⁵⁶⁷⁸⁹]?\)$/.test(label);
    return (
      <p className={`alin${isLit ? " is-lit" : ""}${hi}`}>
        <b className="lb">{label}</b>
        {text}
      </p>
    );
  }
  return (
    <p className={`alin pl-0!${hi}`}>
      <b>{label}</b> {text}
    </p>
  );
}
