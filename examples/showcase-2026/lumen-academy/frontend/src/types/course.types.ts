export interface Course {
  id: string;
  name: string;
  category?: string;
  durationHours?: number;
  instructor?: string;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type CourseCreateInput = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;
export type CourseUpdateInput = Partial<CourseCreateInput>;