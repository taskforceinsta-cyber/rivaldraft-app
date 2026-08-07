-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EntryPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isViceCaptain" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EntryPlayer_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EntryPlayer" ("entryId", "id", "playerId") SELECT "entryId", "id", "playerId" FROM "EntryPlayer";
DROP TABLE "EntryPlayer";
ALTER TABLE "new_EntryPlayer" RENAME TO "EntryPlayer";
CREATE UNIQUE INDEX "EntryPlayer_entryId_playerId_key" ON "EntryPlayer"("entryId", "playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
