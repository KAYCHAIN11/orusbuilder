import { PrismaClient } from '@prisma/client';
import { CashForecast } from '../models/cashforecast.model';

const prisma = new PrismaClient();

/**
 * Repository for CashForecast entity
 */
export class CashForecastRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.cashForecast.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: CashForecast[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.cashForecast.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.cashForecast.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<CashForecast | null> {
    return await prisma.cashForecast.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<CashForecast, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CashForecast> {
    return await prisma.cashForecast.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<CashForecast>): Promise<CashForecast> {
    return await prisma.cashForecast.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<CashForecast> {
    return await prisma.cashForecast.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.cashForecast.count();
  }

  async searchByName(query: string): Promise<CashForecast[]> {
    return await prisma.cashForecast.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const cashforecastRepository = new CashForecastRepository();