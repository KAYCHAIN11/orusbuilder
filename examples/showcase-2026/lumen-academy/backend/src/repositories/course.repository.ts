import { PrismaClient } from '@prisma/client';
import { Course } from '../models/course.model';

const prisma = new PrismaClient();

/**
 * Repository for Course entity
 */
export class CourseRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.course.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.course.aggregate({ _sum: { durationHours: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { durationHours: Number(totals._sum.durationHours ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Course[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.course.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Course | null> {
    return await prisma.course.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Course> {
    return await prisma.course.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Course>): Promise<Course> {
    return await prisma.course.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Course> {
    return await prisma.course.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.course.count();
  }

  async searchByName(query: string): Promise<Course[]> {
    return await prisma.course.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const courseRepository = new CourseRepository();