import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import WalletActions from "@/components/WalletActions";
import { money } from "@/lib/format";

const TX_LABEL: Record<string, string> = {
  DEPOSIT: "Test-fund top-up",
  WITHDRAWAL: "Withdrawal request",
  ENTRY_FEE: "League entry fee",
  PRIZE_PAYOUT: "Prize payout",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/account");

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">Wallet</span>
            <h1>{money(user?.walletCents ?? 0)}</h1>
            <p className="lead">
              Test-money balance — nothing here represents real currency until a licensed payment
              processor is wired in.
            </p>
          </div>

          <WalletActions />

          <h2 className="dash-sub-h" style={{ marginTop: 44 }}>
            Transaction history
          </h2>
          <div className="board-panel card" style={{ padding: 0 }}>
            <div className="tx-list">
              <div className="tx-row tx-row-head">
                <span>Date</span>
                <span>Type</span>
                <span>Note</span>
                <span>Status</span>
                <span>Amount</span>
              </div>
              {transactions.length === 0 && (
                <div style={{ padding: "20px", color: "var(--muted)" }}>No transactions yet.</div>
              )}
              {transactions.map((t) => (
                <div className="tx-row" key={t.id}>
                  <span className="p-muted">{t.createdAt.toLocaleDateString()}</span>
                  <span>{TX_LABEL[t.type] ?? t.type}</span>
                  <span className="p-muted">{t.note}</span>
                  <span>
                    <span className={`tx-status tx-${t.status.toLowerCase()}`}>{t.status}</span>
                  </span>
                  <span className={t.amountCents < 0 ? "tx-neg" : "tx-pos"}>
                    {t.amountCents < 0 ? "-" : "+"}
                    {money(Math.abs(t.amountCents))}
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
