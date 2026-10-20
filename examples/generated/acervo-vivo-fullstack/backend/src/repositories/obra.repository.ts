import { PrismaClient } from '@prisma/client';
import { Obra } from '../models/obra.model';

const prisma = new PrismaClient();

/**
 * Repository for Obra entity
 */
export class ObraRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.obra.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Obra[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.obra.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.obra.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Obra | null> {
    return await prisma.obra.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Obra> {
    return await prisma.obra.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Obra>): Promise<Obra> {
    return await prisma.obra.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Obra> {
    return await prisma.obra.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.obra.count();
  }

  async searchByName(query: string): Promise<Obra[]> {
    return await prisma.obra.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const obraRepository = new ObraRepository();