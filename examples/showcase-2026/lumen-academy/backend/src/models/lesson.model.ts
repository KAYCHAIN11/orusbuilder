export interface Lesson {
  id: string;
  name: string;
  courseId: string;
  position: number;
  contentUrl?: string | null;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}