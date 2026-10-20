export interface Assessment {
  id: string;
  name: string;
  courseId?: string | null;
  dueAt?: Date | string | null;
  maximumScore: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}