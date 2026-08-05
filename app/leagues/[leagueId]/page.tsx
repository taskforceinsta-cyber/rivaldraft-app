import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import { money, salaryFmt, relativeStart } from "@/lib/format";

export default async function LeagueLeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ joined?: string }>;
}) {
  const { leagueId } = await params;
  const { joined } = await searchParams;
  const session = await auth();

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      sport: true,
      entries: {
        include: { user: true, players: { include: { player: true } } },
        orderBy: { totalPoints: "desc" },
      },
    },
  });
  if (!league) notFound();

  const myEntry = session?.user
    ? league.entries.find((e) => e.userId === session.user.id)
    : undefined;

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">
              {league.sport.emoji} {league.sport.name} · {relativeStart(league.startAt)}
            </span>
            <h1>{league.title}</h1>
            <p className="lead">
              Entry {league.entryFeeCents === 0 ? "Free" : money(league.entryFeeCents)} · Salary
              cap {salaryFmt(league.salaryCap)} · {league.entries.length}/{league.maxEntries} entries
            </p>
          </div>

          {joined === "1" && (
            <div className="form-success">Squad locked in — good luck out there.</div>
          )}

          {!myEntry && (
            <Link href={`/draft/${league.id}`} className="btn btn-primary" style={{ marginBottom: 28 }}>
              Join this league
            </Link>
          )}

          <div className="board-panel card">
            <div className="panel-head">
              <span>Standings</span>
            </div>
            <div className="board-list">
              <div className="board-row board-row-head">
                <span>#</span>
                <span>Manager</span>
                <span className="squad">Squad</span>
                <span>Pts</span>
              </div>
              {league.entries.length === 0 && (
                <div className="prow" style={{ color: "var(--muted)" }}>
                  No entries yet — be the first to join.
                </div>
              )}
              {league.entries.map((entry, i) => {
                const isMe = session?.user && entry.userId === session.user.id;
                return (
                  <div
                    className={`board-row ${i === 0 ? "lead" : ""} ${isMe ? "you" : ""}`}
                    key={entry.id}
                  >
                    <span className="rank">{i + 1}</span>
                    <span className="mgr">{isMe ? "You" : entry.user.name}</span>
                    <span className="squad">{entry.squadName}</span>
                    <span className="pts">{entry.totalPoints.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {myEntry && (
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ color: "#fff", marginBottom: 14 }}>Your squad — {myEntry.squadName}</h3>
              <div className="player-table" style={{ border: "1px solid var(--line)", borderRadius: 12 }}>
                <div className="prow prow-head">
                  <span>Player</span>
                  <span>Team</span>
                  <span>Pos</span>
                  <span>Salary</span>
                  <span>Pts</span>
                  <span></span>
                </div>
                {myEntry.players.map((ep) => (
                  <div className="prow" key={ep.id}>
                    <span className="p-name">{ep.player.name}</span>
                    <span className="p-muted">{ep.player.team}</span>
                    <span className="p-muted">{ep.player.position}</span>
                    <span className="p-salary">{salaryFmt(ep.player.salary)}</span>
                    <span className="p-proj">{ep.player.livePoints.toFixed(1)}</span>
                    <span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
