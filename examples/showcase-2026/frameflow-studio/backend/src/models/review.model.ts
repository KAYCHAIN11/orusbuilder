export interface Review {
  id: string;
  name: string;
  reviewer: string;
  rating?: number | null;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}