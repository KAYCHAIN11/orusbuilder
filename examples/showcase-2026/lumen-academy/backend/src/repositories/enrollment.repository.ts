import { PrismaClient } from '@prisma/client';
import { Enrollment } from '../models/enrollment.model';

const prisma = new PrismaClient();

/**
 * Repository for Enrollment entity
 */
export class EnrollmentRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.enrollment.aggregate({ _sum: { progress: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { progress: Number(totals._sum.progress ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Enrollment[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.enrollment.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Enrollment | null> {
    return await prisma.enrollment.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Enrollment> {
    return await prisma.enrollment.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Enrollment>): Promise<Enrollment> {
    return await prisma.enrollment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Enrollment> {
    return await prisma.enrollment.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.enrollment.count();
  }

  async searchByName(query: string): Promise<Enrollment[]> {
    return await prisma.enrollment.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();