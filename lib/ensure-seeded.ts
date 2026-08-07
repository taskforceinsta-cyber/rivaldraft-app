import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

// This deployment runs on a host without persistent storage guarantees
// (e.g. Render's Free tier resets the SQLite file on every redeploy), so
// rather than relying on someone remembering to re-run the seed script,
// self-heal: if the database is ever found empty, seed it automatically.
// The in-memory flag avoids re-checking on every request within the same
// running process -- only the first request after a cold start pays for
// the count query.
let checked = false;

export async function ensureSeeded() {
  if (checked) return;
  const sportCount = await prisma.sport.count();
  if (sportCount === 0) {
    await seedDatabase(prisma);
  }
  checked = true;
}
