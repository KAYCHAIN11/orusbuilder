import { PrismaClient } from '@prisma/client';
import { Report } from '../models/report.model';

const prisma = new PrismaClient();

/**
 * Repository for Report entity
 */
export class ReportRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.report.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.report.aggregate({ _sum: { value: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { value: Number(totals._sum.value ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Report[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.report.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Report | null> {
    return await prisma.report.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Report> {
    return await prisma.report.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Report>): Promise<Report> {
    return await prisma.report.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Report> {
    return await prisma.report.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.report.count();
  }

  async searchByName(query: string): Promise<Report[]> {
    return await prisma.report.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const reportRepository = new ReportRepository();