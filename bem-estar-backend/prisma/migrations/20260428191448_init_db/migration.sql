-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sono" TEXT NOT NULL,
    "humor" TEXT NOT NULL,
    "alimentacao" TEXT NOT NULL,
    "conselhoIA" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
