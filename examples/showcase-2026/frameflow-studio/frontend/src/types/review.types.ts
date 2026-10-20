export interface Review {
  id: string;
  name: string;
  reviewer: string;
  rating?: number;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ReviewCreateInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;
export type ReviewUpdateInput = Partial<ReviewCreateInput>;