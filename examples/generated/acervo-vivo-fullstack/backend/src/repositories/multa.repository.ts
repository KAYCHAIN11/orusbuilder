import { PrismaClient } from '@prisma/client';
import { Multa } from '../models/multa.model';

const prisma = new PrismaClient();

/**
 * Repository for Multa entity
 */
export class MultaRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.multa.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Multa[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.multa.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.multa.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Multa | null> {
    return await prisma.multa.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Multa, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Multa> {
    return await prisma.multa.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Multa>): Promise<Multa> {
    return await prisma.multa.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Multa> {
    return await prisma.multa.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.multa.count();
  }

  async searchByName(query: string): Promise<Multa[]> {
    return await prisma.multa.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const multaRepository = new MultaRepository();