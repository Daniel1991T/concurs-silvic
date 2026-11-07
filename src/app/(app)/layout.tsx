import { Header } from "@/components/shell/header";
import { Sidebar } from "@/components/shell/sidebar";
import { getExam } from "@/lib/content";

/** Cadrul aplicației: antetul, bara laterală cu lecțiile și conținutul paginii. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header title={getExam().title} />
      <div className="md:grid md:grid-cols-[304px_minmax(0,1fr)]">
        <Sidebar />
        <main id="continut" className="min-w-0">
          <div className="px-4 pt-6 pb-12 md:px-12 md:pt-8 md:pb-16">{children}</div>
        </main>
      </div>
    </>
  );
}
