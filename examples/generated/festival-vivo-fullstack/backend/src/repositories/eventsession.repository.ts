import { PrismaClient } from '@prisma/client';
import { EventSession } from '../models/eventsession.model';

const prisma = new PrismaClient();

/**
 * Repository for EventSession entity
 */
export class EventSessionRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.eventSession.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: EventSession[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.eventSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.eventSession.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<EventSession | null> {
    return await prisma.eventSession.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<EventSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventSession> {
    return await prisma.eventSession.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<EventSession>): Promise<EventSession> {
    return await prisma.eventSession.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<EventSession> {
    return await prisma.eventSession.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.eventSession.count();
  }

  async searchByName(query: string): Promise<EventSession[]> {
    return await prisma.eventSession.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const eventsessionRepository = new EventSessionRepository();