export interface Reserva {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ReservaCreateInput = Omit<Reserva, 'id' | 'createdAt' | 'updatedAt'>;
export type ReservaUpdateInput = Partial<ReservaCreateInput>;