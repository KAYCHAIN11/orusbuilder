import { PrismaClient } from '@prisma/client';
import { DeliveryRoute } from '../models/deliveryroute.model';

const prisma = new PrismaClient();

/**
 * Repository for DeliveryRoute entity
 */
export class DeliveryRouteRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.deliveryRoute.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.deliveryRoute.aggregate({ _sum: { stops: true, distance: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { stops: Number(totals._sum.stops ?? 0), distance: Number(totals._sum.distance ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: DeliveryRoute[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.deliveryRoute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.deliveryRoute.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<DeliveryRoute | null> {
    return await prisma.deliveryRoute.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DeliveryRoute> {
    return await prisma.deliveryRoute.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<DeliveryRoute>): Promise<DeliveryRoute> {
    return await prisma.deliveryRoute.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<DeliveryRoute> {
    return await prisma.deliveryRoute.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.deliveryRoute.count();
  }

  async searchByName(query: string): Promise<DeliveryRoute[]> {
    return await prisma.deliveryRoute.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const deliveryrouteRepository = new DeliveryRouteRepository();