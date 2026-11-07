import type { Metadata, Viewport } from "next";
// Fonturile vin din pachete npm, nu de la Google la fiecare încărcare: merg și offline.
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/source-sans-3";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { Providers } from "@/components/shell/providers";
import { getExam, getModuleCounts } from "@/lib/content";

const exam = getExam();

export const metadata: Metadata = {
  title: { default: exam.title, template: `%s · ${exam.title}` },
  description: `Pregătire pentru ${exam.title} — ${exam.subtitle}`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f4a33" },
    { media: "(prefers-color-scheme: dark)", color: "#0b110d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes pune data-theme pe <html> înainte de hidratare
    <html lang="ro" suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers counts={getModuleCounts()}>
          <a
            href="#continut"
            className="sr-only z-50 rounded-md bg-accent px-4 py-3 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Sari la conținut
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
