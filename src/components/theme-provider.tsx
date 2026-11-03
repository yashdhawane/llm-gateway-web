"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Thin wrapper so the root layout can stay a server component.
 *
 * `attribute="class"` is what the shadcn tokens expect: `globals.css` defines
 * the dark palette under `.dark`, not under a media query.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
