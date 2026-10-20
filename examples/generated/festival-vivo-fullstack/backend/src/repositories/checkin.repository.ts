import { PrismaClient } from '@prisma/client';
import { CheckIn } from '../models/checkin.model';

const prisma = new PrismaClient();

/**
 * Repository for CheckIn entity
 */
export class CheckInRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.checkIn.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: CheckIn[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.checkIn.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<CheckIn | null> {
    return await prisma.checkIn.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CheckIn> {
    return await prisma.checkIn.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<CheckIn>): Promise<CheckIn> {
    return await prisma.checkIn.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<CheckIn> {
    return await prisma.checkIn.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.checkIn.count();
  }

  async searchByName(query: string): Promise<CheckIn[]> {
    return await prisma.checkIn.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const checkinRepository = new CheckInRepository();