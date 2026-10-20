import { PrismaClient } from '@prisma/client';
import { TrackingEvent } from '../models/trackingevent.model';

const prisma = new PrismaClient();

/**
 * Repository for TrackingEvent entity
 */
export class TrackingEventRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.trackingEvent.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: TrackingEvent[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.trackingEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.trackingEvent.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<TrackingEvent | null> {
    return await prisma.trackingEvent.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<TrackingEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TrackingEvent> {
    return await prisma.trackingEvent.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<TrackingEvent>): Promise<TrackingEvent> {
    return await prisma.trackingEvent.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<TrackingEvent> {
    return await prisma.trackingEvent.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.trackingEvent.count();
  }

  async searchByName(query: string): Promise<TrackingEvent[]> {
    return await prisma.trackingEvent.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const trackingeventRepository = new TrackingEventRepository();