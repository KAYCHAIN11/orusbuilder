import { PrismaClient } from '@prisma/client';
import { Professional } from '../models/professional.model';

const prisma = new PrismaClient();

/**
 * Repository for Professional entity
 */
export class ProfessionalRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.professional.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Professional[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.professional.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Professional | null> {
    return await prisma.professional.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Professional> {
    return await prisma.professional.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Professional>): Promise<Professional> {
    return await prisma.professional.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Professional> {
    return await prisma.professional.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.professional.count();
  }

  async searchByName(query: string): Promise<Professional[]> {
    return await prisma.professional.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const professionalRepository = new ProfessionalRepository();