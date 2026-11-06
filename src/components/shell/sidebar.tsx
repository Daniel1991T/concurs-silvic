import { Suspense } from "react";
import { getExam, getSideEntries } from "@/lib/content";
import { SidebarClient } from "./sidebar-client";

/** Bara laterală cu lecțiile, construită din bibliografia concursului. */
export function Sidebar() {
  const exam = getExam();
  const ready = exam.modules.filter((m) => m.status === "ready").length;
  return (
    <Suspense fallback={<div className="hidden border-r border-line bg-surface md:block" />}>
      <SidebarClient entries={getSideEntries()} ready={ready} total={exam.modules.length} />
    </Suspense>
  );
}
