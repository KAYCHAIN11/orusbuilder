import { PrismaClient } from '@prisma/client';
import { Application } from '../models/application.model';

const prisma = new PrismaClient();

/**
 * Repository for Application entity
 */
export class ApplicationRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.application.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.application.aggregate({ _sum: { score: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { score: Number(totals._sum.score ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Application[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.application.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Application | null> {
    return await prisma.application.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Application> {
    return await prisma.application.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Application>): Promise<Application> {
    return await prisma.application.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Application> {
    return await prisma.application.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.application.count();
  }

  async searchByName(query: string): Promise<Application[]> {
    return await prisma.application.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const applicationRepository = new ApplicationRepository();