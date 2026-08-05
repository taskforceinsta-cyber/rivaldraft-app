import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import { decideWithdrawal } from "@/lib/actions";
import { money } from "@/lib/format";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [userCount, leagueCount, entryCount, pending] = await Promise.all([
    prisma.user.count(),
    prisma.league.count(),
    prisma.entry.count(),
    prisma.transaction.findMany({
      where: { type: "WITHDRAWAL", status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">Admin</span>
            <h1>Management console</h1>
            <p className="lead">Users, leagues, and pending payout requests.</p>
          </div>

          <div className="dash-stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            <div className="card dash-stat-card">
              <span className="cc-label">Users</span>
              <span className="dash-stat-val">{userCount}</span>
              <Link href="/admin/users" className="btn btn-ghost-light btn-sm" style={{ marginTop: 12 }}>
                View all
              </Link>
            </div>
            <div className="card dash-stat-card">
              <span className="cc-label">Leagues</span>
              <span className="dash-stat-val">{leagueCount}</span>
            </div>
            <div className="card dash-stat-card">
              <span className="cc-label">Squads entered</span>
              <span className="dash-stat-val">{entryCount}</span>
            </div>
            <div className="card dash-stat-card">
              <span className="cc-label">Pending payouts</span>
              <span className="dash-stat-val">{pending.length}</span>
            </div>
          </div>

          <h2 className="dash-sub-h">Pending withdrawal requests</h2>
          <div className="board-panel card" style={{ padding: 0 }}>
            <div className="tx-list">
              <div className="admin-tx-row admin-tx-head">
                <span>Requested</span>
                <span>User</span>
                <span>Amount</span>
                <span>Note</span>
                <span>Decision</span>
              </div>
              {pending.length === 0 && (
                <div style={{ padding: "20px", color: "var(--muted)" }}>
                  No pending requests — you&rsquo;re all caught up.
                </div>
              )}
              {pending.map((tx) => (
                <div className="admin-tx-row" key={tx.id}>
                  <span className="p-muted">{tx.createdAt.toLocaleString()}</span>
                  <span>
                    {tx.user.name}
                    <span className="p-muted" style={{ display: "block", fontSize: 12 }}>
                      {tx.user.email}
                    </span>
                  </span>
                  <span className="tx-neg">{money(Math.abs(tx.amountCents))}</span>
                  <span className="p-muted">{tx.note}</span>
                  <span className="admin-decide">
                    <form action={decideWithdrawal}>
                      <input type="hidden" name="txId" value={tx.id} />
                      <input type="hidden" name="decision" value="approve" />
                      <button type="submit" className="btn btn-sm btn-primary">
                        Approve
                      </button>
                    </form>
                    <form action={decideWithdrawal}>
                      <input type="hidden" name="txId" value={tx.id} />
                      <input type="hidden" name="decision" value="reject" />
                      <button type="submit" className="btn btn-sm btn-danger">
                        Reject
                      </button>
                    </form>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
