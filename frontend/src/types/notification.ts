export type NotificationType =
  | 'INVOICE_CREATED'
  | 'INVOICE_UPDATED'
  | 'INVOICE_SUBMITTED'
  | 'INVOICE_VALIDATED'
  | 'INVOICE_REJECTED'
  | 'INVOICE_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'CUSTOMER_ADDED'
  | 'CUSTOMER_UPDATED'
  | 'ORGANIZATION_MEMBER_ADDED'
  | 'ORGANIZATION_MEMBER_REMOVED'
  | 'COMPLIANCE_ALERT'
  | 'COMPLIANCE_DEADLINE'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'OTHER';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  priority: NotificationPriority;
  metadata?: any;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

