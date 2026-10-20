import { PrismaClient } from '@prisma/client';
import { SensorReading } from '../models/sensorreading.model';

const prisma = new PrismaClient();

/**
 * Repository for SensorReading entity
 */
export class SensorReadingRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.sensorReading.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: SensorReading[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.sensorReading.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.sensorReading.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<SensorReading | null> {
    return await prisma.sensorReading.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<SensorReading, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SensorReading> {
    return await prisma.sensorReading.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<SensorReading>): Promise<SensorReading> {
    return await prisma.sensorReading.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<SensorReading> {
    return await prisma.sensorReading.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.sensorReading.count();
  }

  async searchByName(query: string): Promise<SensorReading[]> {
    return await prisma.sensorReading.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const sensorreadingRepository = new SensorReadingRepository();