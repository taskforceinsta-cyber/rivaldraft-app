import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Every route here reads from the database or a user session — there's no
// genuinely static content to prerender. Forcing dynamic rendering across
// the whole app avoids Next.js attempting to statically generate pages at
// build time (before any database connection exists), which is what broke
// the Render build: /leagues has no auth() call, so nothing else marked it
// dynamic, and Next tried to prerender it against an unreachable database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FantasyKings88 — Draft Your Rivals. Win The League.",
  description:
    "FantasyKings88 is a season-long fantasy sports league platform. Build your squad, draft against real rivals, and compete for the table all season.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
