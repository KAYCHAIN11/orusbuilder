export interface Notification {
  id: string;
  name: string;
  channel: string;
  recipient: string;
  scheduledAt?: Date | string;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type NotificationCreateInput = Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>;
export type NotificationUpdateInput = Partial<NotificationCreateInput>;