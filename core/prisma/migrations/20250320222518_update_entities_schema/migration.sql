-- CreateTable
CREATE TABLE "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "status" TEXT DEFAULT '{}',
    "config" TEXT DEFAULT '{}',
    "roomId" INTEGER,
    "lastUpdated" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entity_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_linkedEntity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_linkedEntity_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_linkedEntity_B_fkey" FOREIGN KEY ("B") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_linkedEntity_AB_unique" ON "_linkedEntity"("A", "B");

-- CreateIndex
CREATE INDEX "_linkedEntity_B_index" ON "_linkedEntity"("B");
