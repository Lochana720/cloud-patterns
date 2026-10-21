import type { Metadata, Viewport } from "next";
import Link from "next/link";
import CommandPalette from "@/components/CommandPalette";
import SearchButton from "@/components/SearchButton";
import ThemeToggle from "@/components/ThemeToggle";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cloud Patterns — a field guide to resilient cloud design",
    template: "%s | Cloud Patterns",
  },
  description:
    "Fourteen cloud design patterns explained with live diagrams: the problem each solves, how it works, and the AWS, Azure and Google Cloud services that implement it.",
  openGraph: { type: "website", siteName: "Cloud Patterns" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1729" },
  ],
};

// Applies the saved or system theme before first paint, so there's no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
              <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
                <rect x="2" y="9" width="11" height="14" rx="2" fill="none" stroke="var(--blue)" strokeWidth="2" />
                <rect x="19" y="3" width="11" height="10" rx="2" fill="none" stroke="var(--blue)" strokeWidth="2" />
                <rect x="19" y="19" width="11" height="10" rx="2" fill="none" stroke="var(--blue)" strokeWidth="2" />
                <path d="M13 16h3v-8h3M16 16v8h3" fill="none" stroke="var(--blue)" strokeWidth="2" />
                <circle cx="16" cy="16" r="2.6" fill="var(--signal)" />
              </svg>
              <span style={{ fontStretch: "112%" }}>Cloud Patterns</span>
            </Link>
            <nav className="flex items-center gap-2">
              <SearchButton />
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-24 border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:justify-between sm:px-6">
            <p>Built with Next.js and Tailwind CSS, hosted free on Vercel.</p>
            <p>Service names change often. Check each provider&apos;s docs before you build.</p>
          </div>
        </footer>

        <CommandPalette />
      </body>
    </html>
  );
}
