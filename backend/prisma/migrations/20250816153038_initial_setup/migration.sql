-- CreateTable
CREATE TABLE "public"."Asset" (
    "assetId" DECIMAL(78,0) NOT NULL,
    "description" TEXT NOT NULL,
    "registrationTs" TIMESTAMP(3) NOT NULL,
    "registeredBy" TEXT NOT NULL,
    "currentOwner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("assetId")
);

-- CreateTable
CREATE TABLE "public"."AssetTransfer" (
    "id" BIGSERIAL NOT NULL,
    "assetId" DECIMAL(78,0) NOT NULL,
    "previousOwner" TEXT NOT NULL,
    "newOwner" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockTimestamp" TIMESTAMP(3) NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventCursor" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCursor_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Asset_currentOwner_idx" ON "public"."Asset"("currentOwner");

-- CreateIndex
CREATE INDEX "AssetTransfer_assetId_idx" ON "public"."AssetTransfer"("assetId");

-- CreateIndex
CREATE INDEX "AssetTransfer_blockNumber_idx" ON "public"."AssetTransfer"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AssetTransfer_txHash_logIndex_key" ON "public"."AssetTransfer"("txHash", "logIndex");

-- AddForeignKey
ALTER TABLE "public"."AssetTransfer" ADD CONSTRAINT "AssetTransfer_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("assetId") ON DELETE CASCADE ON UPDATE CASCADE;
