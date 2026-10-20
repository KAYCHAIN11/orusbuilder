import { PrismaClient } from '@prisma/client';
import { Account } from '../models/account.model';

const prisma = new PrismaClient();

/**
 * Repository for Account entity
 */
export class AccountRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.account.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Account[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.account.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.account.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Account | null> {
    return await prisma.account.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Account> {
    return await prisma.account.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Account>): Promise<Account> {
    return await prisma.account.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Account> {
    return await prisma.account.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.account.count();
  }

  async searchByName(query: string): Promise<Account[]> {
    return await prisma.account.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const accountRepository = new AccountRepository();