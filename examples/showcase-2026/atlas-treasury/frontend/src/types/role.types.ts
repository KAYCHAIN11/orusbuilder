export interface Role {
  id: string;
  name: string;
  scope: string;
  permissions: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type RoleCreateInput = Omit<Role, 'id' | 'createdAt' | 'updatedAt'>;
export type RoleUpdateInput = Partial<RoleCreateInput>;