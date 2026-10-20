import { PrismaClient } from '@prisma/client';
import { Transaction } from '../models/transaction.model';

const prisma = new PrismaClient();

/**
 * Repository for Transaction entity
 */
export class TransactionRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.transaction.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.transaction.aggregate({ _sum: { amount: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { amount: Number(totals._sum.amount ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Transaction[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    return await prisma.transaction.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Transaction> {
    return await prisma.transaction.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.transaction.count();
  }

  async searchByName(query: string): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const transactionRepository = new TransactionRepository();