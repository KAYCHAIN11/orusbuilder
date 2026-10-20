import { PrismaClient } from '@prisma/client';
import { Assessment } from '../models/assessment.model';

const prisma = new PrismaClient();

/**
 * Repository for Assessment entity
 */
export class AssessmentRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.assessment.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.assessment.aggregate({ _sum: { maximumScore: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { maximumScore: Number(totals._sum.maximumScore ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Assessment[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.assessment.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Assessment | null> {
    return await prisma.assessment.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Assessment> {
    return await prisma.assessment.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Assessment>): Promise<Assessment> {
    return await prisma.assessment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Assessment> {
    return await prisma.assessment.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.assessment.count();
  }

  async searchByName(query: string): Promise<Assessment[]> {
    return await prisma.assessment.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const assessmentRepository = new AssessmentRepository();