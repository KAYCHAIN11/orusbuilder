import { PrismaClient } from '@prisma/client';
import { Shipment } from '../models/shipment.model';

const prisma = new PrismaClient();

/**
 * Repository for Shipment entity
 */
export class ShipmentRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.shipment.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Shipment[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.shipment.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Shipment | null> {
    return await prisma.shipment.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Shipment> {
    return await prisma.shipment.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Shipment>): Promise<Shipment> {
    return await prisma.shipment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Shipment> {
    return await prisma.shipment.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.shipment.count();
  }

  async searchByName(query: string): Promise<Shipment[]> {
    return await prisma.shipment.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const shipmentRepository = new ShipmentRepository();