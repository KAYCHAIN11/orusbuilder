import { PrismaClient } from '@prisma/client';
import { Vehicle } from '../models/vehicle.model';

const prisma = new PrismaClient();

/**
 * Repository for Vehicle entity
 */
export class VehicleRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.vehicle.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.vehicle.aggregate({ _sum: { capacity: true } }),
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Vehicle[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.vehicle.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Vehicle | null> {
    return await prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Vehicle> {
    return await prisma.vehicle.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    return await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Vehicle> {
    return await prisma.vehicle.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.vehicle.count();
  }

  async searchByName(query: string): Promise<Vehicle[]> {
    return await prisma.vehicle.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const vehicleRepository = new VehicleRepository();