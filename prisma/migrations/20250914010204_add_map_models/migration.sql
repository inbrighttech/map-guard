-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopifyVariantId" TEXT NOT NULL,
    "shopifyProductId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "mapPrice" DECIMAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "display" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "shopifyChargeId" TEXT,
    "planName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "includedProducts" INTEGER NOT NULL,
    "overageRate" DECIMAL NOT NULL,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "trialEndsAt" DATETIME,
    "lastBillingAmount" DECIMAL NOT NULL,
    "lastUsageCheck" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BillingPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "maxEnabledProducts" INTEGER NOT NULL,
    "baseAmount" DECIMAL NOT NULL,
    "overageAmount" DECIMAL NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BillingPeriod_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopifyVariantId_key" ON "Product"("shopifyVariantId");

-- CreateIndex
CREATE INDEX "Product_shop_idx" ON "Product"("shop");

-- CreateIndex
CREATE INDEX "Product_shopifyProductId_idx" ON "Product"("shopifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_shop_key" ON "Subscription"("shop");

-- CreateIndex
CREATE INDEX "BillingPeriod_shop_idx" ON "BillingPeriod"("shop");

-- CreateIndex
CREATE INDEX "BillingPeriod_shop_periodStart_periodEnd_idx" ON "BillingPeriod"("shop", "periodStart", "periodEnd");
