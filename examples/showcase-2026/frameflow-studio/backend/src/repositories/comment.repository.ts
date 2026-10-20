import { PrismaClient } from '@prisma/client';
import { Comment } from '../models/comment.model';

const prisma = new PrismaClient();

/**
 * Repository for Comment entity
 */
export class CommentRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.comment.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups] = await prisma.$transaction([
      grouping,
      
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = {  };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Comment[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.comment.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Comment | null> {
    return await prisma.comment.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Comment> {
    return await prisma.comment.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Comment>): Promise<Comment> {
    return await prisma.comment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Comment> {
    return await prisma.comment.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.comment.count();
  }

  async searchByName(query: string): Promise<Comment[]> {
    return await prisma.comment.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const commentRepository = new CommentRepository();