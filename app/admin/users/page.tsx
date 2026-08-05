import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import { money } from "@/lib/format";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/admin/users");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <>
      <AppNav />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow violet">Admin</span>
            <h1>Users</h1>
            <p className="lead">{users.length} registered accounts.</p>
          </div>

          <div className="board-panel card" style={{ padding: 0 }}>
            <div className="tx-list">
              <div className="admin-user-row admin-tx-head">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Wallet</span>
                <span>Squads</span>
                <span>Joined</span>
              </div>
              {users.map((u) => (
                <div className="admin-user-row" key={u.id}>
                  <span>{u.name}</span>
                  <span className="p-muted">{u.email}</span>
                  <span>
                    <span className={`role-badge ${u.role === "ADMIN" ? "role-admin" : ""}`}>
                      {u.role}
                    </span>
                  </span>
                  <span>{money(u.walletCents)}</span>
                  <span>{u._count.entries}</span>
                  <span className="p-muted">{u.createdAt.toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
