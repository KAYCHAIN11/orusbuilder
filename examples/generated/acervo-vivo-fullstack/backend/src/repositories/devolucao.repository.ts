import { PrismaClient } from '@prisma/client';
import { Devolucao } from '../models/devolucao.model';

const prisma = new PrismaClient();

/**
 * Repository for Devolucao entity
 */
export class DevolucaoRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.devolucao.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Devolucao[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.devolucao.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.devolucao.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Devolucao | null> {
    return await prisma.devolucao.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Devolucao, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Devolucao> {
    return await prisma.devolucao.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Devolucao>): Promise<Devolucao> {
    return await prisma.devolucao.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Devolucao> {
    return await prisma.devolucao.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.devolucao.count();
  }

  async searchByName(query: string): Promise<Devolucao[]> {
    return await prisma.devolucao.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const devolucaoRepository = new DevolucaoRepository();