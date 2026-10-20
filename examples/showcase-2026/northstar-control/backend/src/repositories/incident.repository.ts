import { PrismaClient } from '@prisma/client';
import { Incident } from '../models/incident.model';

const prisma = new PrismaClient();

/**
 * Repository for Incident entity
 */
export class IncidentRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.incident.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Incident[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.incident.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Incident | null> {
    return await prisma.incident.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Incident> {
    return await prisma.incident.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    return await prisma.incident.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Incident> {
    return await prisma.incident.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.incident.count();
  }

  async searchByName(query: string): Promise<Incident[]> {
    return await prisma.incident.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const incidentRepository = new IncidentRepository();