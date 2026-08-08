import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import CrownIcon from "@/components/CrownIcon";
import JerseyIcon from "@/components/JerseyIcon";
import { money, salaryFmt, relativeStart } from "@/lib/format";
import { teamColor, sortByPosition } from "@/lib/team-color";

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

  const squadByPosition = myEntry
    ? sortByPosition(
        Array.from(
          myEntry.players.reduce((groups, ep) => {
            const list = groups.get(ep.player.position) ?? [];
            list.push(ep);
            groups.set(ep.player.position, list);
            return groups;
          }, new Map<string, typeof myEntry.players>())
        )
      )
    : [];

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">
              {league.sport.emoji} {league.sport.name} ·{" "}
              {league.status === "LIVE"
                ? "Live now"
                : league.status === "COMPLETED"
                  ? "Completed"
                  : relativeStart(league.startAt)}
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

          {!myEntry && league.status === "UPCOMING" && (
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
            <div className="card formation-panel" style={{ marginTop: 24 }}>
              <div className="panel-head">
                <CrownIcon size={14} className="kc-crown" />
                <span>Your squad — {myEntry.squadName}</span>
              </div>
              <div className="formation-board">
                <div className="formation-goalbox top" />
                <div className="formation-goalbox bottom" />
                {squadByPosition.map(([position, group]) => (
                  <div className="formation-tier" key={position}>
                    <span className="formation-tier-label">{position}</span>
                    <div className="formation-tier-players">
                      {group.map((ep) => {
                        const effectivePts = ep.isCaptain
                          ? ep.player.livePoints * 2
                          : ep.player.livePoints;
                        return (
                          <div className="player-card" key={ep.id}>
                            <div className="player-card-avatar">
                              <JerseyIcon color={teamColor(ep.player.team)} size={40} />
                            </div>
                            {ep.isCaptain && <span className="player-card-badge c">C</span>}
                            {ep.isViceCaptain && (
                              <span className="player-card-badge vc">VC</span>
                            )}
                            <span className="player-card-name">{ep.player.name}</span>
                            <span className="player-card-team">{ep.player.team}</span>
                            <span className="player-card-salary">
                              {salaryFmt(ep.player.salary)}
                            </span>
                            <span className="player-card-pts">
                              {effectivePts.toFixed(1)}
                              {ep.isCaptain && <span className="pts-x2">&times;2</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
