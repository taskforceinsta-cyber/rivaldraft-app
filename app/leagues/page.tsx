import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import LeagueGrid, { LeagueCardData } from "@/components/LeagueGrid";

export default async function LeaguesPage() {
  const leagues = await prisma.league.findMany({
    include: { sport: true, entries: true },
    orderBy: { startAt: "asc" },
  });

  const leagueCards: LeagueCardData[] = leagues.map((l) => ({
    id: l.id,
    title: l.title,
    sportName: l.sport.name,
    sportEmoji: l.sport.emoji,
    startAt: l.startAt.toISOString(),
    entryFeeCents: l.entryFeeCents,
    entryCount: l.entries.length,
    maxEntries: l.maxEntries,
    status: l.status,
  }));

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">All leagues</span>
            <h1>Pick a league to join.</h1>
            <p className="lead">Every open league across every sport we run.</p>
          </div>
          <LeagueGrid leagues={leagueCards} />
        </div>
      </section>
    </>
  );
}
