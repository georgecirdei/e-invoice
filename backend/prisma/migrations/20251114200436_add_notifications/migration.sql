-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INVOICE_CREATED', 'INVOICE_UPDATED', 'INVOICE_SUBMITTED', 'INVOICE_VALIDATED', 'INVOICE_REJECTED', 'INVOICE_CANCELLED', 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'CUSTOMER_ADDED', 'CUSTOMER_UPDATED', 'ORGANIZATION_MEMBER_ADDED', 'ORGANIZATION_MEMBER_REMOVED', 'COMPLIANCE_ALERT', 'COMPLIANCE_DEADLINE', 'SYSTEM_ANNOUNCEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
