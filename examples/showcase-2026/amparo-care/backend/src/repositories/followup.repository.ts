import { PrismaClient } from '@prisma/client';
import { FollowUp } from '../models/followup.model';

const prisma = new PrismaClient();

/**
 * Repository for FollowUp entity
 */
export class FollowUpRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.followUp.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: FollowUp[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.followUp.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<FollowUp | null> {
    return await prisma.followUp.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FollowUp> {
    return await prisma.followUp.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<FollowUp>): Promise<FollowUp> {
    return await prisma.followUp.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<FollowUp> {
    return await prisma.followUp.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.followUp.count();
  }

  async searchByName(query: string): Promise<FollowUp[]> {
    return await prisma.followUp.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const followupRepository = new FollowUpRepository();