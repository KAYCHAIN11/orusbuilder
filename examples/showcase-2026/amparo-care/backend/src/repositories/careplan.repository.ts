import { PrismaClient } from '@prisma/client';
import { CarePlan } from '../models/careplan.model';

const prisma = new PrismaClient();

/**
 * Repository for CarePlan entity
 */
export class CarePlanRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.carePlan.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: CarePlan[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.carePlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.carePlan.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<CarePlan | null> {
    return await prisma.carePlan.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CarePlan> {
    return await prisma.carePlan.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<CarePlan>): Promise<CarePlan> {
    return await prisma.carePlan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<CarePlan> {
    return await prisma.carePlan.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.carePlan.count();
  }

  async searchByName(query: string): Promise<CarePlan[]> {
    return await prisma.carePlan.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const careplanRepository = new CarePlanRepository();