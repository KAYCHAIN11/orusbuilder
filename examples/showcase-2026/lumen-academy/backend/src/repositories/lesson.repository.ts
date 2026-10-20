import { PrismaClient } from '@prisma/client';
import { Lesson } from '../models/lesson.model';

const prisma = new PrismaClient();

/**
 * Repository for Lesson entity
 */
export class LessonRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.lesson.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.lesson.aggregate({ _sum: { position: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { position: Number(totals._sum.position ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Lesson[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.lesson.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Lesson | null> {
    return await prisma.lesson.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Lesson> {
    return await prisma.lesson.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    return await prisma.lesson.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Lesson> {
    return await prisma.lesson.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.lesson.count();
  }

  async searchByName(query: string): Promise<Lesson[]> {
    return await prisma.lesson.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const lessonRepository = new LessonRepository();