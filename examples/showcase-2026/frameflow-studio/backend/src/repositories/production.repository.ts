import { PrismaClient } from '@prisma/client';
import { Production } from '../models/production.model';

const prisma = new PrismaClient();

/**
 * Repository for Production entity
 */
export class ProductionRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.production.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Production[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.production.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.production.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Production | null> {
    return await prisma.production.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Production> {
    return await prisma.production.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Production>): Promise<Production> {
    return await prisma.production.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Production> {
    return await prisma.production.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.production.count();
  }

  async searchByName(query: string): Promise<Production[]> {
    return await prisma.production.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const productionRepository = new ProductionRepository();