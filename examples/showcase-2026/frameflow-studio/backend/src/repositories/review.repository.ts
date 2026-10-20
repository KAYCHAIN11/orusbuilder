import { PrismaClient } from '@prisma/client';
import { Review } from '../models/review.model';

const prisma = new PrismaClient();

/**
 * Repository for Review entity
 */
export class ReviewRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.review.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.review.aggregate({ _sum: { rating: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { rating: Number(totals._sum.rating ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Review[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Review | null> {
    return await prisma.review.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Review> {
    return await prisma.review.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Review>): Promise<Review> {
    return await prisma.review.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Review> {
    return await prisma.review.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.review.count();
  }

  async searchByName(query: string): Promise<Review[]> {
    return await prisma.review.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();