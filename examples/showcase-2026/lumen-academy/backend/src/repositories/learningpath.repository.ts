import { PrismaClient } from '@prisma/client';
import { LearningPath } from '../models/learningpath.model';

const prisma = new PrismaClient();

/**
 * Repository for LearningPath entity
 */
export class LearningPathRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.learningPath.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: LearningPath[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.learningPath.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.learningPath.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<LearningPath | null> {
    return await prisma.learningPath.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LearningPath> {
    return await prisma.learningPath.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<LearningPath>): Promise<LearningPath> {
    return await prisma.learningPath.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<LearningPath> {
    return await prisma.learningPath.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.learningPath.count();
  }

  async searchByName(query: string): Promise<LearningPath[]> {
    return await prisma.learningPath.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const learningpathRepository = new LearningPathRepository();