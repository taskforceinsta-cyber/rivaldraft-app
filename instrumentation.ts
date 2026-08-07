// Runs once when the server process starts, before any request is handled --
// unlike calling ensureSeeded() from a layout/page component, this has no
// race with concurrently-rendering pages that query the database. See
// lib/ensure-seeded.ts for why this self-heal exists at all.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSeeded } = await import("@/lib/ensure-seeded");
    await ensureSeeded();
  }
}
