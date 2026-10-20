import { PrismaClient } from '@prisma/client';
import { Driver } from '../models/driver.model';

const prisma = new PrismaClient();

/**
 * Repository for Driver entity
 */
export class DriverRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.driver.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Driver[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.driver.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Driver | null> {
    return await prisma.driver.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Driver> {
    return await prisma.driver.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Driver>): Promise<Driver> {
    return await prisma.driver.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Driver> {
    return await prisma.driver.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.driver.count();
  }

  async searchByName(query: string): Promise<Driver[]> {
    return await prisma.driver.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const driverRepository = new DriverRepository();