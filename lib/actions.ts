"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

const SQUAD_SIZE = 5;
const MAX_MESSAGE_LEN = 500;

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function postLeagueMessage(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const leagueId = String(formData.get("leagueId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!body || body.length > MAX_MESSAGE_LEN) return;

  const entry = await prisma.entry.findUnique({
    where: { userId_leagueId: { userId: session.user.id, leagueId } },
  });
  if (!entry) return; // chat is only for managers who are actually in this league's pot

  await prisma.leagueMessage.create({
    data: { leagueId, userId: session.user.id, body },
  });

  revalidatePath(`/leagues/${leagueId}`);
}

export async function submitEntry(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const leagueId = String(formData.get("leagueId") || "");
  const squadName = String(formData.get("squadName") || "").trim() || "My Squad";
  const playerIds = formData.getAll("playerId").map(String);
  const captainId = String(formData.get("captainId") || "");
  const viceCaptainId = String(formData.get("viceCaptainId") || "");

  if (playerIds.length !== SQUAD_SIZE) {
    return { error: `Pick exactly ${SQUAD_SIZE} players.` };
  }
  if (!captainId || !viceCaptainId) {
    return { error: "Pick a captain and a vice-captain." };
  }
  if (captainId === viceCaptainId) {
    return { error: "Captain and vice-captain must be different players." };
  }
  if (!playerIds.includes(captainId) || !playerIds.includes(viceCaptainId)) {
    return { error: "Captain and vice-captain must be part of your squad." };
  }

  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) return { error: "League not found." };
  if (league.status !== "UPCOMING") return { error: "This league has already started." };

  const existing = await prisma.entry.findUnique({
    where: { userId_leagueId: { userId: session.user.id, leagueId } },
  });
  if (existing) return { error: "You already have a squad in this league." };

  const players = await prisma.player.findMany({ where: { id: { in: playerIds } } });
  if (players.length !== SQUAD_SIZE) return { error: "Invalid player selection." };

  const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
  if (totalSalary > league.salaryCap) {
    return { error: "Squad exceeds the salary cap." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Your session is out of date. Please log out and log back in." };
  if (user.walletCents < league.entryFeeCents) {
    return { error: "Insufficient wallet balance. Top up in your Wallet." };
  }

  const entryCount = await prisma.entry.count({ where: { leagueId } });
  if (entryCount >= league.maxEntries) {
    return { error: "This league is full." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.entry.create({
      data: {
        userId: session.user.id,
        leagueId,
        squadName,
        players: {
          create: playerIds.map((playerId) => ({
            playerId,
            isCaptain: playerId === captainId,
            isViceCaptain: playerId === viceCaptainId,
          })),
        },
      },
    });

    if (league.entryFeeCents > 0) {
      await tx.user.update({
        where: { id: session.user.id },
        data: { walletCents: { decrement: league.entryFeeCents } },
      });
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "ENTRY_FEE",
          status: "COMPLETED",
          amountCents: -league.entryFeeCents,
          note: `Entry fee — ${league.title}`,
          decidedAt: new Date(),
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/leagues/${leagueId}`);
  redirect(`/leagues/${leagueId}?joined=1`);
}

export async function requestWithdrawal(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const amountCents = Math.round(Number(formData.get("amount")) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { error: "Enter a valid amount." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Your session is out of date. Please log out and log back in." };
  if (amountCents > user.walletCents) return { error: "Amount exceeds your wallet balance." };

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: "WITHDRAWAL",
      status: "PENDING",
      amountCents: -amountCents,
      note: "Withdrawal request (test funds)",
    },
  });

  revalidatePath("/account");
  return { ok: true };
}

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function decideWithdrawal(formData: FormData): Promise<void> {
  await requireAdmin();

  const txId = String(formData.get("txId") || "");
  const decision = String(formData.get("decision") || "");
  if (!["approve", "reject"].includes(decision)) return;

  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx || tx.type !== "WITHDRAWAL" || tx.status !== "PENDING") {
    return;
  }

  if (decision === "approve") {
    const user = await prisma.user.findUnique({ where: { id: tx.userId } });
    if (!user || user.walletCents < Math.abs(tx.amountCents)) {
      await prisma.transaction.update({
        where: { id: txId },
        data: { status: "REJECTED", decidedAt: new Date(), note: `${tx.note} — auto-rejected, insufficient balance` },
      });
      revalidatePath("/admin");
      return;
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tx.userId },
        data: { walletCents: { decrement: Math.abs(tx.amountCents) } },
      }),
      prisma.transaction.update({
        where: { id: txId },
        data: { status: "COMPLETED", decidedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.transaction.update({
      where: { id: txId },
      data: { status: "REJECTED", decidedAt: new Date() },
    });
  }

  revalidatePath("/admin");
}

export async function simulateGameweek(formData: FormData): Promise<void> {
  await requireAdmin();

  const leagueId = String(formData.get("leagueId") || "");
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { entries: { include: { players: true } } },
  });
  if (!league) return;

  const players = await prisma.player.findMany({ where: { sportId: league.sportId } });

  await prisma.$transaction([
    ...players.map((p) => {
      const swing = (Math.random() - 0.3) * (p.projPoints * 0.6);
      const nextLive = Math.max(0, p.livePoints + p.projPoints * 0.15 + swing);
      return prisma.player.update({ where: { id: p.id }, data: { livePoints: nextLive } });
    }),
  ]);

  const freshPlayers = await prisma.player.findMany({ where: { sportId: league.sportId } });
  const pointsById = new Map(freshPlayers.map((p) => [p.id, p.livePoints]));

  await prisma.$transaction([
    ...league.entries.map((entry) => {
      const total = entry.players.reduce((sum, ep) => {
        const pts = pointsById.get(ep.playerId) ?? 0;
        return sum + (ep.isCaptain ? pts * 2 : pts);
      }, 0);
      return prisma.entry.update({ where: { id: entry.id }, data: { totalPoints: total } });
    }),
    prisma.league.update({
      where: { id: leagueId },
      data: { status: league.status === "UPCOMING" ? "LIVE" : league.status },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath(`/leagues/${leagueId}`);
  revalidatePath("/dashboard");
  revalidatePath("/leagues");
  revalidatePath("/");
}

export async function requestDeposit(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  const amountCents = Math.round(Number(formData.get("amount")) * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { error: "Enter a valid amount." };
  }
  if (amountCents > 5_000_000) {
    return { error: "Max test top-up is $50,000 at a time." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Your session is out of date. Please log out and log back in." };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { walletCents: { increment: amountCents } },
    });
    await tx.transaction.create({
      data: {
        userId: session.user.id,
        type: "DEPOSIT",
        status: "COMPLETED",
        amountCents,
        note: "Test-fund top-up",
        decidedAt: new Date(),
      },
    });
  });

  revalidatePath("/account");
  return { ok: true };
}
