import { PrismaClient } from '@prisma/client';
import { CostCenter } from '../models/costcenter.model';

const prisma = new PrismaClient();

/**
 * Repository for CostCenter entity
 */
export class CostCenterRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.costCenter.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: CostCenter[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.costCenter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.costCenter.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<CostCenter | null> {
    return await prisma.costCenter.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<CostCenter, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CostCenter> {
    return await prisma.costCenter.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<CostCenter>): Promise<CostCenter> {
    return await prisma.costCenter.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<CostCenter> {
    return await prisma.costCenter.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.costCenter.count();
  }

  async searchByName(query: string): Promise<CostCenter[]> {
    return await prisma.costCenter.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const costcenterRepository = new CostCenterRepository();