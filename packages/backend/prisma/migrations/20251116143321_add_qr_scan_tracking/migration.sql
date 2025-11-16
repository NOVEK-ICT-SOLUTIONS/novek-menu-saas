-- CreateTable
CREATE TABLE "QRScan" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "QRScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QRScan_restaurantId_idx" ON "QRScan"("restaurantId");

-- CreateIndex
CREATE INDEX "QRScan_scannedAt_idx" ON "QRScan"("scannedAt");

-- AddForeignKey
ALTER TABLE "QRScan" ADD CONSTRAINT "QRScan_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
