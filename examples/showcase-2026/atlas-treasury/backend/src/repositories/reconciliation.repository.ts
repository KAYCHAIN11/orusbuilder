import { PrismaClient } from '@prisma/client';
import { Reconciliation } from '../models/reconciliation.model';

const prisma = new PrismaClient();

/**
 * Repository for Reconciliation entity
 */
export class ReconciliationRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.reconciliation.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Reconciliation[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.reconciliation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.reconciliation.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Reconciliation | null> {
    return await prisma.reconciliation.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Reconciliation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Reconciliation> {
    return await prisma.reconciliation.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Reconciliation>): Promise<Reconciliation> {
    return await prisma.reconciliation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Reconciliation> {
    return await prisma.reconciliation.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.reconciliation.count();
  }

  async searchByName(query: string): Promise<Reconciliation[]> {
    return await prisma.reconciliation.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const reconciliationRepository = new ReconciliationRepository();