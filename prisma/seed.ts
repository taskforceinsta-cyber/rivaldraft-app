import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const sports = await Promise.all(
    [
      { name: "Football", emoji: "⚽" },
      { name: "Basketball", emoji: "🏀" },
      { name: "Esports", emoji: "🎮" },
      { name: "Cricket", emoji: "🏏" },
      { name: "Motorsport", emoji: "🏁" },
    ].map((s) =>
      prisma.sport.upsert({ where: { name: s.name }, update: {}, create: s })
    )
  );
  const [football, basketball, esports, cricket, motorsport] = sports;

  const adminHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@rivaldraft.test" },
    update: {},
    create: {
      name: "RivalDraft Admin",
      email: "admin@rivaldraft.test",
      passwordHash: adminHash,
      role: "ADMIN",
      walletCents: 0,
    },
  });

  const demoHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where: { email: "demo@rivaldraft.test" },
    update: {},
    create: {
      name: "Demo Manager",
      email: "demo@rivaldraft.test",
      passwordHash: demoHash,
      role: "USER",
    },
  });

  const footballPlayers = [
    { name: "M. Salah", team: "Liverpool", position: "FWD", salary: 12500, proj: 9.8 },
    { name: "E. Haaland", team: "Man City", position: "FWD", salary: 13000, proj: 10.4 },
    { name: "K. De Bruyne", team: "Man City", position: "MID", salary: 11500, proj: 8.9 },
    { name: "B. Saka", team: "Arsenal", position: "MID", salary: 10200, proj: 7.6 },
    { name: "R. Sterling", team: "Chelsea", position: "MID", salary: 8600, proj: 6.1 },
    { name: "Ederson", team: "Man City", position: "GK", salary: 5400, proj: 5.2 },
    { name: "V. van Dijk", team: "Liverpool", position: "DEF", salary: 7200, proj: 6.4 },
    { name: "W. Saliba", team: "Arsenal", position: "DEF", salary: 6600, proj: 5.9 },
    { name: "D. Rice", team: "Arsenal", position: "MID", salary: 7800, proj: 6.8 },
    { name: "P. Foden", team: "Man City", position: "MID", salary: 9600, proj: 7.9 },
  ];
  const basketballPlayers = [
    { name: "N. Jokic", team: "Nuggets", position: "C", salary: 13000, proj: 51.1 },
    { name: "G. Antetokounmpo", team: "Bucks", position: "F", salary: 12500, proj: 50.3 },
    { name: "L. Doncic", team: "Mavericks", position: "G", salary: 12000, proj: 49.8 },
    { name: "J. Embiid", team: "76ers", position: "C", salary: 11200, proj: 47.6 },
    { name: "L. James", team: "Lakers", position: "F", salary: 10200, proj: 45.2 },
    { name: "S. Curry", team: "Warriors", position: "G", salary: 9400, proj: 44.1 },
    { name: "D. Booker", team: "Suns", position: "G", salary: 8400, proj: 38.7 },
    { name: "A. Edwards", team: "Timberwolves", position: "G", salary: 7600, proj: 36.2 },
    { name: "B. Adebayo", team: "Heat", position: "C", salary: 6600, proj: 32.4 },
    { name: "J. Brown", team: "Celtics", position: "F", salary: 5400, proj: 29.8 },
  ];
  const esportsPlayers = [
    { name: "Faker", team: "T1", position: "MID", salary: 13000, proj: 22.4 },
    { name: "Chovy", team: "GenG", position: "MID", salary: 12200, proj: 21.6 },
    { name: "Caps", team: "G2", position: "MID", salary: 11000, proj: 20.1 },
    { name: "Ruler", team: "GenG", position: "ADC", salary: 9800, proj: 19.8 },
    { name: "Canyon", team: "GenG", position: "JNG", salary: 8600, proj: 18.4 },
    { name: "Zeus", team: "T1", position: "TOP", salary: 7400, proj: 16.9 },
    { name: "Keria", team: "T1", position: "SUP", salary: 6200, proj: 15.2 },
    { name: "Oner", team: "T1", position: "JNG", salary: 5400, proj: 14.6 },
  ];
  const cricketPlayers = [
    { name: "V. Kohli", team: "India", position: "BAT", salary: 13000, proj: 62.3 },
    { name: "B. Stokes", team: "England", position: "AR", salary: 12000, proj: 44.1 },
    { name: "J. Bumrah", team: "India", position: "BOWL", salary: 10800, proj: 38.4 },
    { name: "S. Smith", team: "Australia", position: "BAT", salary: 9600, proj: 41.2 },
    { name: "R. Jadeja", team: "India", position: "AR", salary: 8400, proj: 33.9 },
    { name: "P. Cummins", team: "Australia", position: "BOWL", salary: 7200, proj: 29.6 },
    { name: "J. Buttler", team: "England", position: "WK", salary: 6200, proj: 34.5 },
    { name: "S. Gill", team: "India", position: "BAT", salary: 5400, proj: 30.1 },
  ];
  const motorsportPlayers = [
    { name: "M. Verstappen", team: "Red Bull", position: "DRIVER", salary: 13000, proj: 24.5 },
    { name: "L. Norris", team: "McLaren", position: "DRIVER", salary: 11800, proj: 20.2 },
    { name: "L. Hamilton", team: "Ferrari", position: "DRIVER", salary: 10600, proj: 18.9 },
    { name: "C. Leclerc", team: "Ferrari", position: "DRIVER", salary: 9400, proj: 17.6 },
    { name: "G. Russell", team: "Mercedes", position: "DRIVER", salary: 8200, proj: 16.1 },
    { name: "O. Piastri", team: "McLaren", position: "DRIVER", salary: 7000, proj: 15.4 },
    { name: "F. Alonso", team: "Aston Martin", position: "DRIVER", salary: 6200, proj: 13.8 },
    { name: "S. Perez", team: "Red Bull", position: "DRIVER", salary: 5400, proj: 12.9 },
  ];

  async function upsertPlayers(
    list: { name: string; team: string; position: string; salary: number; proj: number }[],
    sportId: string
  ) {
    for (const p of list) {
      const existing = await prisma.player.findFirst({ where: { name: p.name, sportId } });
      const data = {
        team: p.team,
        position: p.position,
        salary: p.salary,
        projPoints: p.proj,
      };
      if (existing) {
        await prisma.player.update({ where: { id: existing.id }, data });
      } else {
        await prisma.player.create({ data: { name: p.name, sportId, livePoints: 0, ...data } });
      }
    }
  }

  await upsertPlayers(footballPlayers, football.id);
  await upsertPlayers(basketballPlayers, basketball.id);
  await upsertPlayers(esportsPlayers, esports.id);
  await upsertPlayers(cricketPlayers, cricket.id);
  await upsertPlayers(motorsportPlayers, motorsport.id);

  const leagueDefs = [
    { title: "Premier Weekend Showdown", sportId: football.id, entryFeeCents: 1000, daysOut: 3 },
    { title: "Hardwood Heads-Up", sportId: basketball.id, entryFeeCents: 0, daysOut: 1 },
    { title: "Rift Rivals Fantasy Cup", sportId: esports.id, entryFeeCents: 500, daysOut: 2 },
    { title: "Boundary Chasers", sportId: cricket.id, entryFeeCents: 800, daysOut: 5 },
    { title: "Grid Predictor GP", sportId: motorsport.id, entryFeeCents: 600, daysOut: 4 },
  ];

  for (const l of leagueDefs) {
    const existing = await prisma.league.findFirst({ where: { title: l.title } });
    if (existing) continue;
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + l.daysOut);
    await prisma.league.create({
      data: {
        title: l.title,
        sportId: l.sportId,
        entryFeeCents: l.entryFeeCents,
        startAt,
        salaryCap: 55000,
        maxEntries: 5000,
        status: "UPCOMING",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
