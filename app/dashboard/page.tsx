import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import { money, relativeStart } from "@/lib/format";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/dashboard");

  const [user, entries, openLeagues] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.entry.findMany({
      where: { userId: session.user.id },
      include: { league: { include: { sport: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.league.count({ where: { status: "UPCOMING" } }),
  ]);

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Welcome back</span>
            <h1>Hi, {user?.name?.split(" ")[0] ?? "there"}.</h1>
            <p className="lead">Here&rsquo;s where your squads and wallet stand right now.</p>
          </div>

          <div className="dash-stats">
            <div className="card dash-stat-card">
              <span className="cc-label">Wallet balance</span>
              <span className="dash-stat-val">{money(user?.walletCents ?? 0)}</span>
              <Link href="/account" className="btn btn-ghost-light btn-sm" style={{ marginTop: 12 }}>
                Manage wallet
              </Link>
            </div>
            <div className="card dash-stat-card">
              <span className="cc-label">Active squads</span>
              <span className="dash-stat-val">{entries.length}</span>
            </div>
            <div className="card dash-stat-card">
              <span className="cc-label">Open leagues</span>
              <span className="dash-stat-val">{openLeagues}</span>
              <Link href="/leagues" className="btn btn-ghost-light btn-sm" style={{ marginTop: 12 }}>
                Browse leagues
              </Link>
            </div>
          </div>

          <h2 className="dash-sub-h">Your squads</h2>
          {entries.length === 0 ? (
            <div className="card">
              <p style={{ color: "var(--text-soft)", marginBottom: 16 }}>
                You haven&rsquo;t entered a league yet.
              </p>
              <Link href="/leagues" className="btn btn-primary">
                Browse leagues
              </Link>
            </div>
          ) : (
            <div className="league-grid">
              {entries.map((e) => (
                <div className="contest-card" key={e.id}>
                  <div className="cc-top">
                    <span className="cc-sport">
                      {e.league.sport.emoji} {e.league.sport.name}
                    </span>
                    <span className="cc-status status-live">{e.totalPoints.toFixed(1)} pts</span>
                  </div>
                  <h3 className="cc-title">{e.league.title}</h3>
                  <p className="cc-meta">
                    {e.squadName} · {relativeStart(e.league.startAt)}
                  </p>
                  <Link href={`/leagues/${e.leagueId}`} className="btn btn-ghost-light cc-cta">
                    View standings
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
