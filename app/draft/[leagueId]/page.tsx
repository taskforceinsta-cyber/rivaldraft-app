import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import DraftBuilder from "@/components/DraftBuilder";
import { money, salaryFmt } from "@/lib/format";

export default async function DraftPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?from=/draft/${leagueId}`);

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { sport: true },
  });
  if (!league) notFound();

  const [players, existingEntry, user] = await Promise.all([
    prisma.player.findMany({ where: { sportId: league.sportId }, orderBy: { salary: "desc" } }),
    prisma.entry.findUnique({
      where: { userId_leagueId: { userId: session.user.id, leagueId } },
    }),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  return (
    <>
      <AppNav />
      <section className="sec draft-sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">
              {league.sport.emoji} {league.sport.name}
            </span>
            <h1>{league.title}</h1>
            <p className="lead">
              Salary cap {salaryFmt(league.salaryCap)} · Entry {league.entryFeeCents === 0 ? "Free" : money(league.entryFeeCents)} · Your wallet {user ? money(user.walletCents) : "—"}
            </p>
          </div>

          {existingEntry ? (
            <div className="card draft-done">
              <h3>You&rsquo;re already in this league</h3>
              <p>
                Your squad &ldquo;{existingEntry.squadName}&rdquo; is locked in. Check the
                leaderboard to see how you&rsquo;re doing.
              </p>
              <a href={`/leagues/${leagueId}`} className="btn btn-primary">
                View leaderboard
              </a>
            </div>
          ) : league.status !== "UPCOMING" ? (
            <div className="card draft-done">
              <h3>This league has already started</h3>
              <p>Drafting closes once a league goes live. Try another upcoming league.</p>
              <a href="/leagues" className="btn btn-primary">
                Browse leagues
              </a>
            </div>
          ) : (
            <DraftBuilder
              leagueId={league.id}
              salaryCap={league.salaryCap}
              players={players.map((p) => ({
                id: p.id,
                name: p.name,
                team: p.team,
                position: p.position,
                salary: p.salary,
                projPoints: p.projPoints,
              }))}
            />
          )}
        </div>
      </section>
    </>
  );
}
