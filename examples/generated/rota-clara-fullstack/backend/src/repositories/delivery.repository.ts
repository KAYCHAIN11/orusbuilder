import { PrismaClient } from '@prisma/client';
import { Delivery } from '../models/delivery.model';

const prisma = new PrismaClient();

/**
 * Repository for Delivery entity
 */
export class DeliveryRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.delivery.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Delivery[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.delivery.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Delivery | null> {
    return await prisma.delivery.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Delivery> {
    return await prisma.delivery.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Delivery>): Promise<Delivery> {
    return await prisma.delivery.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Delivery> {
    return await prisma.delivery.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.delivery.count();
  }

  async searchByName(query: string): Promise<Delivery[]> {
    return await prisma.delivery.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const deliveryRepository = new DeliveryRepository();