import { PrismaClient } from '@prisma/client';
import { Take } from '../models/take.model';

const prisma = new PrismaClient();

/**
 * Repository for Take entity
 */
export class TakeRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.take.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Take[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.take.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.take.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Take | null> {
    return await prisma.take.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Take, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Take> {
    return await prisma.take.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Take>): Promise<Take> {
    return await prisma.take.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Take> {
    return await prisma.take.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.take.count();
  }

  async searchByName(query: string): Promise<Take[]> {
    return await prisma.take.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const takeRepository = new TakeRepository();