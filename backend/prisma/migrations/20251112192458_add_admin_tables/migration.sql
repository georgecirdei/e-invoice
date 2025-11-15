-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "CountryConfig" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiProvider" TEXT NOT NULL,
    "apiBaseUrl" TEXT,
    "apiClientId" TEXT,
    "apiClientSecret" TEXT,
    "xmlFormat" TEXT NOT NULL,
    "xmlNamespace" TEXT,
    "requiresTaxId" BOOLEAN NOT NULL DEFAULT true,
    "requiresRegNumber" BOOLEAN NOT NULL DEFAULT false,
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "standardTaxRate" DECIMAL(5,2) NOT NULL,
    "reducedTaxRate" DECIMAL(5,2),
    "zeroTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "pattern" TEXT,
    "errorMessage" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XmlTemplate" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "xmlStructure" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XmlTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "settingType" TEXT NOT NULL,
    "description" TEXT,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryConfig_countryCode_key" ON "CountryConfig"("countryCode");

-- CreateIndex
CREATE INDEX "CountryConfig_countryCode_idx" ON "CountryConfig"("countryCode");

-- CreateIndex
CREATE INDEX "CountryConfig_isActive_idx" ON "CountryConfig"("isActive");

-- CreateIndex
CREATE INDEX "ComplianceRule_countryId_idx" ON "ComplianceRule"("countryId");

-- CreateIndex
CREATE INDEX "ComplianceRule_isActive_idx" ON "ComplianceRule"("isActive");

-- CreateIndex
CREATE INDEX "XmlTemplate_countryId_idx" ON "XmlTemplate"("countryId");

-- CreateIndex
CREATE INDEX "XmlTemplate_isActive_idx" ON "XmlTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "XmlTemplate_countryId_templateType_version_key" ON "XmlTemplate"("countryId", "templateType", "version");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_settingKey_key" ON "SystemSettings"("settingKey");

-- CreateIndex
CREATE INDEX "SystemSettings_settingKey_idx" ON "SystemSettings"("settingKey");

-- AddForeignKey
ALTER TABLE "ComplianceRule" ADD CONSTRAINT "ComplianceRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XmlTemplate" ADD CONSTRAINT "XmlTemplate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
