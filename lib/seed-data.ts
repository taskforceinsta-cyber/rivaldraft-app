import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Football/soccer only -- this platform is not multi-sport.
export async function seedDatabase(prisma: PrismaClient) {
  const football = await prisma.sport.upsert({
    where: { name: "Football" },
    update: {},
    create: { name: "Football", emoji: "⚽" },
  });

  // Shared test credentials for friends trying this out at every permission
  // level. Password is the same across all variants; the email prefix
  // signals which role/persona it logs in as.
  const TEST_PASSWORD = "TESTACCOUNT123!@#";
  const testHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const testAccounts: { email: string; name: string; role: "USER" | "ADMIN" }[] = [
    { email: "testaccount@fantasykings88.test", name: "Test Player", role: "USER" },
    { email: "testaccount-player2@fantasykings88.test", name: "Test Player Two", role: "USER" },
    { email: "testaccount-admin@fantasykings88.test", name: "Test Management", role: "ADMIN" },
  ];

  for (const acc of testAccounts) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { passwordHash: testHash, role: acc.role, name: acc.name },
      create: {
        name: acc.name,
        email: acc.email,
        passwordHash: testHash,
        role: acc.role,
        walletCents: acc.role === "ADMIN" ? 0 : 1_000_000,
      },
    });
  }

  const footballPlayers = [
    { name: "M. Salah", team: "Liverpool", position: "FWD", salary: 12500, proj: 9.8, apps: 22, goals: 15, assists: 8, shotAcc: 48, ppg: 8.9 },
    { name: "E. Haaland", team: "Man City", position: "FWD", salary: 13000, proj: 10.4, apps: 20, goals: 19, assists: 3, shotAcc: 61, ppg: 9.6 },
    { name: "K. De Bruyne", team: "Man City", position: "MID", salary: 11500, proj: 8.9, apps: 18, goals: 5, assists: 12, shotAcc: 39, ppg: 7.8 },
    { name: "B. Saka", team: "Arsenal", position: "MID", salary: 10200, proj: 7.6, apps: 23, goals: 9, assists: 7, shotAcc: 43, ppg: 6.9 },
    { name: "R. Sterling", team: "Chelsea", position: "MID", salary: 8600, proj: 6.1, apps: 19, goals: 6, assists: 4, shotAcc: 37, ppg: 5.4 },
    { name: "Ederson", team: "Man City", position: "GK", salary: 5400, proj: 5.2, apps: 24, goals: 0, assists: 0, shotAcc: 0, ppg: 4.6 },
    { name: "V. van Dijk", team: "Liverpool", position: "DEF", salary: 7200, proj: 6.4, apps: 25, goals: 3, assists: 1, shotAcc: 44, ppg: 5.7 },
    { name: "W. Saliba", team: "Arsenal", position: "DEF", salary: 6600, proj: 5.9, apps: 24, goals: 2, assists: 1, shotAcc: 40, ppg: 5.3 },
    { name: "D. Rice", team: "Arsenal", position: "MID", salary: 7800, proj: 6.8, apps: 24, goals: 3, assists: 5, shotAcc: 35, ppg: 6.1 },
    { name: "P. Foden", team: "Man City", position: "MID", salary: 9600, proj: 7.9, apps: 21, goals: 10, assists: 6, shotAcc: 45, ppg: 7.2 },
    { name: "Alisson", team: "Liverpool", position: "GK", salary: 5600, proj: 5.4, apps: 21, goals: 0, assists: 0, shotAcc: 0, ppg: 4.8 },
    { name: "T. Alexander-Arnold", team: "Liverpool", position: "DEF", salary: 7600, proj: 6.6, apps: 22, goals: 2, assists: 9, shotAcc: 33, ppg: 6.0 },
    { name: "G. Martinelli", team: "Arsenal", position: "FWD", salary: 8800, proj: 7.1, apps: 20, goals: 8, assists: 5, shotAcc: 42, ppg: 6.4 },
    { name: "C. Palmer", team: "Chelsea", position: "MID", salary: 9200, proj: 7.7, apps: 23, goals: 11, assists: 7, shotAcc: 46, ppg: 7.0 },
  ];

  async function upsertPlayers(
    list: {
      name: string;
      team: string;
      position: string;
      salary: number;
      proj: number;
      apps: number;
      goals: number;
      assists: number;
      shotAcc: number;
      ppg: number;
    }[],
    sportId: string
  ) {
    for (const p of list) {
      const existing = await prisma.player.findFirst({ where: { name: p.name, sportId } });
      const data = {
        team: p.team,
        position: p.position,
        salary: p.salary,
        projPoints: p.proj,
        appearances: p.apps,
        goals: p.goals,
        assists: p.assists,
        shotAccuracy: p.shotAcc,
        pointsPerGame: p.ppg,
      };
      if (existing) {
        await prisma.player.update({ where: { id: existing.id }, data });
      } else {
        await prisma.player.create({ data: { name: p.name, sportId, livePoints: 0, ...data } });
      }
    }
  }

  await upsertPlayers(footballPlayers, football.id);

  const leagueDefs = [
    { title: "Premier Weekend Showdown", entryFeeCents: 1000, daysOut: 3 },
    { title: "Friday Night Rivals", entryFeeCents: 500, daysOut: 1 },
    { title: "Sunday League Showcase", entryFeeCents: 0, daysOut: 2 },
    { title: "Matchday Masters", entryFeeCents: 800, daysOut: 4 },
    { title: "Weekend Warriors Cup", entryFeeCents: 600, daysOut: 5 },
  ];

  for (const l of leagueDefs) {
    const existing = await prisma.league.findFirst({ where: { title: l.title } });
    if (existing) continue;
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + l.daysOut);
    await prisma.league.create({
      data: {
        title: l.title,
        sportId: football.id,
        entryFeeCents: l.entryFeeCents,
        startAt,
        salaryCap: 55000,
        maxEntries: 5000,
        status: "UPCOMING",
      },
    });
  }
}
