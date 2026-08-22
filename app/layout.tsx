import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Cursor } from "@/components/site/Cursor";

/**
 * No `weight` array: omitting it serves the variable font, giving us every
 * weight the editorial hierarchy needs (500/600/700/800) from one file.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const SITE_URL = "https://zebite.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zebite — Smarter groceries, planned by AI",
  description:
    "Zebite plans a week of meals and groceries around the food in your pantry, your calorie and protein targets, and your budget — so you buy only what's missing and waste less. One family plan, portioned per person. iOS & Android.",
  keywords: [
    "Zebite",
    "AI grocery planner",
    "meal planning app",
    "grocery budget app",
    "pantry tracker",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Zebite",
    title: "Zebite — smarter groceries, planned by AI",
    description:
      "One AI plan built around your pantry, your nutrition targets and your budget — and one family plan that portions every meal per person.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Zebite — smarter groceries, planned by AI.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zebite — smarter groceries, planned by AI",
    description:
      "One AI plan around your pantry, your targets and your budget — portioned per person for the whole family. Meet Zeb. iOS & Android.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F1EC",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        {/* Flag JS availability before paint so scroll-reveal only hides
            content when it can actually be revealed (no-JS shows everything). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        {/* ── Analytics slot ────────────────────────────────────────────
            Drop your provider snippet here (Plausible / PostHog / GA) and
            assign window.zebiteAnalytics so lib/analytics.ts can forward
            CTA events. No real key is committed.
            e.g. <Script src="..." data-domain="zebite.app" /> */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/* Both no-op unless they apply: SmoothScroll bails under reduced
            motion, Cursor unless the pointer is fine. Neither renders DOM. */}
        <SmoothScroll />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
