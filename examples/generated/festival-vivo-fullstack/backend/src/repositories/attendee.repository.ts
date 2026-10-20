import { PrismaClient } from '@prisma/client';
import { Attendee } from '../models/attendee.model';

const prisma = new PrismaClient();

/**
 * Repository for Attendee entity
 */
export class AttendeeRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.attendee.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Attendee[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.attendee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.attendee.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Attendee | null> {
    return await prisma.attendee.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Attendee, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Attendee> {
    return await prisma.attendee.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Attendee>): Promise<Attendee> {
    return await prisma.attendee.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Attendee> {
    return await prisma.attendee.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.attendee.count();
  }

  async searchByName(query: string): Promise<Attendee[]> {
    return await prisma.attendee.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const attendeeRepository = new AttendeeRepository();