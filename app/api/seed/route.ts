import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

// One-time-use seeding endpoint for hosts without shell access (e.g. Render's
// Free tier). Gated by SEED_SECRET so randoms can't trigger it — visiting
// this URL is meant to replace running `npx prisma db seed` in a shell.
export async function GET(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET is not set on this deployment." },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Invalid or missing secret." }, { status: 403 });
  }

  await seedDatabase(prisma);

  return NextResponse.json({ ok: true, message: "Seed complete." });
}
