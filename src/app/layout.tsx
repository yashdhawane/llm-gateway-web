import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Gateway",
  description: "Dashboard for the LLM Gateway API: sessions, keys, models and usage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
