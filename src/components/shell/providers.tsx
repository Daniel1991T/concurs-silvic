"use client";

import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

type Drawer = { open: boolean; setOpen: (v: boolean) => void };
const DrawerContext = createContext<Drawer | null>(null);

/** Starea sertarului cu lecții de pe telefon, împărțită între antet și bara laterală. */
export function useDrawer(): Drawer {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer trebuie folosit în <Providers>");
  return ctx;
}

function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ open: false, path: "" });
  const pathname = usePathname();
  // Sertarul se închide singur când navighezi la altă pagină.
  const open = state.open && state.path === pathname;
  const setOpen = (v: boolean) => setState({ open: v, path: pathname });
  return <DrawerContext.Provider value={{ open, setOpen }}>{children}</DrawerContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    // data-theme pe <html>: "light" sau "dark"; implicit urmează setarea sistemului.
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DrawerProvider>{children}</DrawerProvider>
    </ThemeProvider>
  );
}
