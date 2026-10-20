export interface Project {
  id: string;
  name: string;
  clientId?: string;
  budget?: number;
  deadline?: Date | string;
  progress?: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ProjectCreateInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type ProjectUpdateInput = Partial<ProjectCreateInput>;