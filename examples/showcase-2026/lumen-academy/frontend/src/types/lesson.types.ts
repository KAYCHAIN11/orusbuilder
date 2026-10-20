export interface Lesson {
  id: string;
  name: string;
  courseId: string;
  position: number;
  contentUrl?: string;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type LessonCreateInput = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>;
export type LessonUpdateInput = Partial<LessonCreateInput>;