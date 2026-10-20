import { PrismaClient } from '@prisma/client';
import { Event } from '../models/event.model';

const prisma = new PrismaClient();

/**
 * Repository for Event entity
 */
export class EventRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.event.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.event.aggregate({ _sum: { capacity: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { capacity: Number(totals._sum.capacity ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Event[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.event.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Event | null> {
    return await prisma.event.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Event> {
    return await prisma.event.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    return await prisma.event.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Event> {
    return await prisma.event.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.event.count();
  }

  async searchByName(query: string): Promise<Event[]> {
    return await prisma.event.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const eventRepository = new EventRepository();