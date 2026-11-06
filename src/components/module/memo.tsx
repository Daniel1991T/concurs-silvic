import type { ModuleContent } from "@/lib/content/schema";
import { RefChip } from "./ref-chip";
import { Rich } from "./rich";

/** Fișa de memorat: tabele „ce / cât / unde scrie” și trucurile de memorare. */
export function Memo({ memo, tricks }: { memo: ModuleContent["memo"]; tricks: string[] }) {
  return (
    <div className="space-y-10">
      {memo.map((t, i) => (
        <section key={i}>
          <h3 className="mb-4 font-serif text-lg leading-tight font-semibold">{t.title}</h3>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[560px]">
              <thead>
                <tr>
                  <th className="w-[46%]">Ce</th>
                  <th>Cât, cum</th>
                  <th className="w-[1%] whitespace-nowrap">Unde scrie</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r, j) => (
                  <tr key={j}>
                    <td>{r.what}</td>
                    <td className="v">{r.value}</td>
                    <td className="whitespace-nowrap">
                      <RefChip refText={r.ref} className="text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {tricks.length > 0 && (
        <section>
          <h3 className="mb-4 font-serif text-lg leading-tight font-semibold">Trucuri de memorare</h3>
          <ul className="flex max-w-(--measure) flex-col gap-3">
            {tricks.map((t, i) => (
              <li key={i} className="border-l-3 border-accent py-1 pl-3">
                <Rich text={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
