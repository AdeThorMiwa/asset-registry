/*
  Warnings:

  - You are about to drop the `EventCursor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."EventCursor";

-- CreateTable
CREATE TABLE "public"."LogReaderCursor" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogReaderCursor_pkey" PRIMARY KEY ("key")
);
