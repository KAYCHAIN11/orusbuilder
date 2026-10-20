import { PrismaClient } from '@prisma/client';
import { Interview } from '../models/interview.model';

const prisma = new PrismaClient();

/**
 * Repository for Interview entity
 */
export class InterviewRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.interview.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Interview[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.interview.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Interview | null> {
    return await prisma.interview.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Interview> {
    return await prisma.interview.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    return await prisma.interview.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Interview> {
    return await prisma.interview.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.interview.count();
  }

  async searchByName(query: string): Promise<Interview[]> {
    return await prisma.interview.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const interviewRepository = new InterviewRepository();