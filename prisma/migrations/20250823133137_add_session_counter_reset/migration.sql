-- CreateTable
CREATE TABLE "SessionCounterReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "resetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionsBeforeReset" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SessionCounterReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SessionCounterReset_userId_resetAt_idx" ON "SessionCounterReset"("userId", "resetAt");
