import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import Logo from "@/components/Logo";
import CrownIcon from "@/components/CrownIcon";
import LeagueGrid, { LeagueCardData } from "@/components/LeagueGrid";

export default async function Home() {
  const session = await auth();

  const [leagues, sports, playerCount, leagueCount] = await Promise.all([
    prisma.league.findMany({
      where: { status: { in: ["UPCOMING", "LIVE"] } },
      include: { sport: true, entries: true },
      orderBy: { startAt: "asc" },
      take: 6,
    }),
    prisma.sport.findMany({
      include: { _count: { select: { leaguePlayers: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.player.count(),
    prisma.league.count(),
  ]);

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

      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="hero-crown-glow" />
        <div className="wrap hero-in">
          <div className="hero-copy">
            <span className="eyebrow gold">
              <CrownIcon size={13} /> Season-long fantasy · Every sport
            </span>
            <h1>
              Build a dynasty.
              <br />
              <span className="hl">Rule the table.</span>
            </h1>
            <p className="hero-lead">
              Draft real players under a salary cap, battle rival managers gameweek by
              gameweek, and climb to the top of the table. Five sports live today, more
              on the way — one platform, one crown.
            </p>
            <div className="hero-ctas">
              <Link href={session ? "/leagues" : "/signup"} className="btn btn-primary btn-lg">
                {session ? "Browse leagues" : "Claim your crown"}
              </Link>
              <Link href="#how" className="btn btn-ghost-light btn-lg">
                See how it works
              </Link>
            </div>
            <div className="hero-trust">
              <span className="ti">Secure test-money play</span>
              <span className="ti">Live gameweek scoring</span>
              <span className="ti">120k+ active managers</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="king-card">
              <div className="kc-head">
                <span className="lc-tag gold">
                  <CrownIcon size={11} /> Hall of Kings
                </span>
                <span className="lc-pot">
                  Prize pot: <b>$4,250</b>
                </span>
              </div>
              <h3 className="lc-title">Friday Night Rivals</h3>
              <div className="kc-podium">
                <div className="kc-rank kc-rank-1">
                  <CrownIcon size={18} className="kc-crown" />
                  <span className="kc-name">K. Ardent</span>
                  <span className="kc-pts">92</span>
                </div>
                <div className="kc-rank">
                  <span className="kc-num">2</span>
                  <span className="kc-name">M. Solis</span>
                  <span className="kc-pts">88</span>
                </div>
                <div className="kc-rank">
                  <span className="kc-num">3</span>
                  <span className="kc-name">You</span>
                  <span className="kc-pts">85</span>
                </div>
                <div className="kc-rank">
                  <span className="kc-num">4</span>
                  <span className="kc-name">D. Okafor</span>
                  <span className="kc-pts">81</span>
                </div>
                <div className="kc-rank">
                  <span className="kc-num">5</span>
                  <span className="kc-name">P. Nowak</span>
                  <span className="kc-pts">79</span>
                </div>
              </div>
              <div className="lc-foot">
                <div className="lc-bar">
                  <div className="lc-fill" style={{ width: "71%" }} />
                </div>
                <span className="lc-sub">3 gameweeks left</span>
              </div>
            </div>
            <div className="float-badge">Squad locked in</div>
          </div>
        </div>

        <div className="wrap">
          <div className="stat-strip">
            <div className="stat-item">
              <span className="stat-val">{sports.length}</span>
              <span className="stat-lbl">Sports live</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{playerCount}+</span>
              <span className="stat-lbl">Players to draft</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{leagueCount}</span>
              <span className="stat-lbl">Open leagues</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">$10K</span>
              <span className="stat-lbl">Test bankroll to start</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sports-strip">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Built to grow</span>
            <h2>One table, every sport.</h2>
            <p className="lead">
              Same platform, same crown to chase — the game underneath adapts to whatever
              you draft for.
            </p>
          </div>
          <div className="sport-icon-grid">
            {sports.map((s) => (
              <div className="sport-icon-card" key={s.id}>
                <span className="sic-emoji">{s.emoji}</span>
                <span className="sic-name">{s.name}</span>
                <span className="sic-count">{s._count.leaguePlayers} players</span>
              </div>
            ))}
            <div className="sport-icon-card sport-icon-card-next">
              <span className="sic-emoji">+</span>
              <span className="sic-name">More sports</span>
              <span className="sic-count">Added by demand</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec leagues" id="sports">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">Pick your game</span>
            <h2>Every sport. One table.</h2>
            <p className="lead">
              Jump into a public league or start a private one with friends — across every sport
              we run.
            </p>
          </div>
          <LeagueGrid leagues={leagueCards} />
        </div>
      </section>

      <section className="sec how" id="how">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Four steps in</span>
            <h2>From sign-up to the podium.</h2>
            <p className="lead">
              No app to install, no separate scoring spreadsheet. It all happens on the table.
            </p>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <span className="how-num">1</span>
              <h4>Join or create a league</h4>
              <p>Drop into an open public league, or start a private one with friends.</p>
            </div>
            <div className="how-step">
              <span className="how-num">2</span>
              <h4>Draft your squad</h4>
              <p>Pick real players within a salary cap and lock it in before the first whistle.</p>
            </div>
            <div className="how-step">
              <span className="how-num">3</span>
              <h4>Score live, gameweek by gameweek</h4>
              <p>Points update as the action happens, straight onto your table.</p>
            </div>
            <div className="how-step">
              <span className="how-num">4</span>
              <h4>Climb the table, win the pot</h4>
              <p>Top the table at season&rsquo;s end and the prize pot — and crown — are yours.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec faq" id="faq">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Good to know</span>
            <h2>Questions, answered.</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item" open>
              <summary>
                What is FantasyKings88?
                <svg
                  className="chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p>
                FantasyKings88 is a season-long fantasy sports platform. Draft a squad of real
                players under a salary cap, join a league, and score points on how they actually
                perform.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                Is this real money?
                <svg
                  className="chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p>
                This build runs on test funds only ($10,000 in play money per new account) —
                nothing here moves real currency.
              </p>
            </details>
            <details className="faq-item">
              <summary>
                Can I play with just my friends?
                <svg
                  className="chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p>Yes — join any open league and invite your group to enter the same one.</p>
            </details>
            <details className="faq-item">
              <summary>
                Will more sports be added?
                <svg
                  className="chev"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p>
                The platform is built sport-agnostic from the ground up, so adding a new sport
                is a content update, not a rebuild. Football, basketball, esports, cricket, and
                motorsport are live today.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="cta" id="join">
        <div className="wrap cta-in">
          <div>
            <span className="eyebrow gold">
              <CrownIcon size={13} /> Season 12 · Drafts open
            </span>
            <h2>Your throne is still open.</h2>
            <p className="lead">
              Create a free account, build your squad, and get on the table before the first
              whistle.
            </p>
          </div>
          <div className="cta-actions">
            <Link href={session ? "/leagues" : "/signup"} className="btn btn-primary btn-lg">
              {session ? "Browse leagues" : "Claim your crown"}
            </Link>
            <Link href="#how" className="btn btn-ghost-light btn-lg">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap foot-in">
          <div className="foot-brand">
            <Link href="/" className="logo">
              <Logo size={30} />
              <span className="logo-word">
                Fantasy<b>Kings88</b>
              </span>
            </Link>
            <p className="foot-tag">Build a dynasty. Rule the table.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <Link href="/leagues">Leagues</Link>
            <a href="#how">How it works</a>
          </div>
          <div className="foot-col">
            <h5>Account</h5>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
          <div className="foot-col">
            <h5>Support</h5>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <p>&copy; 2026 FantasyKings88. All rights reserved.</p>
          <p className="foot-responsible">Test-money build · Play responsibly · 18+ only</p>
        </div>
      </footer>
    </>
  );
}
