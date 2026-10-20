export interface Client {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ClientCreateInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type ClientUpdateInput = Partial<ClientCreateInput>;