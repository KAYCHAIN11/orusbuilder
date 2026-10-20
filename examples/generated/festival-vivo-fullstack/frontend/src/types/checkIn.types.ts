export interface CheckIn {
  id: string;
  name: string;
  ticketId: string;
  checkedInAt?: Date | string;
  gate?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type CheckInCreateInput = Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>;
export type CheckInUpdateInput = Partial<CheckInCreateInput>;