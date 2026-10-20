import { PrismaClient } from '@prisma/client';
import { CareTask } from '../models/caretask.model';

const prisma = new PrismaClient();

/**
 * Repository for CareTask entity
 */
export class CareTaskRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.careTask.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: CareTask[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.careTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.careTask.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<CareTask | null> {
    return await prisma.careTask.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<CareTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CareTask> {
    return await prisma.careTask.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<CareTask>): Promise<CareTask> {
    return await prisma.careTask.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<CareTask> {
    return await prisma.careTask.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.careTask.count();
  }

  async searchByName(query: string): Promise<CareTask[]> {
    return await prisma.careTask.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const caretaskRepository = new CareTaskRepository();