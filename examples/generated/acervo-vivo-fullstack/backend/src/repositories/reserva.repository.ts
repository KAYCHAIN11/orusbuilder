import { PrismaClient } from '@prisma/client';
import { Reserva } from '../models/reserva.model';

const prisma = new PrismaClient();

/**
 * Repository for Reserva entity
 */
export class ReservaRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.reserva.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Reserva[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.reserva.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.reserva.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Reserva | null> {
    return await prisma.reserva.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Reserva, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Reserva> {
    return await prisma.reserva.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Reserva>): Promise<Reserva> {
    return await prisma.reserva.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Reserva> {
    return await prisma.reserva.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.reserva.count();
  }

  async searchByName(query: string): Promise<Reserva[]> {
    return await prisma.reserva.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const reservaRepository = new ReservaRepository();