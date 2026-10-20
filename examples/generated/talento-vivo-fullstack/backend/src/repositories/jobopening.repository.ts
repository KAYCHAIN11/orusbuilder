import { PrismaClient } from '@prisma/client';
import { JobOpening } from '../models/jobopening.model';

const prisma = new PrismaClient();

/**
 * Repository for JobOpening entity
 */
export class JobOpeningRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.jobOpening.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: JobOpening[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.jobOpening.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.jobOpening.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<JobOpening | null> {
    return await prisma.jobOpening.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<JobOpening, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JobOpening> {
    return await prisma.jobOpening.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<JobOpening>): Promise<JobOpening> {
    return await prisma.jobOpening.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<JobOpening> {
    return await prisma.jobOpening.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.jobOpening.count();
  }

  async searchByName(query: string): Promise<JobOpening[]> {
    return await prisma.jobOpening.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const jobopeningRepository = new JobOpeningRepository();