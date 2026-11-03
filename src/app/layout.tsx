import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LLM Gateway",
  description:
    "Dashboard for the LLM Gateway API: sessions, keys, models and usage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
            <span className="text-sm font-medium">LLM Gateway</span>
            <ModeToggle />
          </div>

          {children}

          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
