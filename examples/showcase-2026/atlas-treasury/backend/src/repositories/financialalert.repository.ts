import { PrismaClient } from '@prisma/client';
import { FinancialAlert } from '../models/financialalert.model';

const prisma = new PrismaClient();

/**
 * Repository for FinancialAlert entity
 */
export class FinancialAlertRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.financialAlert.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: FinancialAlert[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.financialAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.financialAlert.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<FinancialAlert | null> {
    return await prisma.financialAlert.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<FinancialAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FinancialAlert> {
    return await prisma.financialAlert.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<FinancialAlert>): Promise<FinancialAlert> {
    return await prisma.financialAlert.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<FinancialAlert> {
    return await prisma.financialAlert.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.financialAlert.count();
  }

  async searchByName(query: string): Promise<FinancialAlert[]> {
    return await prisma.financialAlert.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const financialalertRepository = new FinancialAlertRepository();