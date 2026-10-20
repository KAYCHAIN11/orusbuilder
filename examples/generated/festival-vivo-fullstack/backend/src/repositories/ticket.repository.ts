import { PrismaClient } from '@prisma/client';
import { Ticket } from '../models/ticket.model';

const prisma = new PrismaClient();

/**
 * Repository for Ticket entity
 */
export class TicketRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.ticket.aggregate({ _sum: { price: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { price: Number(totals._sum.price ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Ticket[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.ticket.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Ticket | null> {
    return await prisma.ticket.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Ticket> {
    return await prisma.ticket.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    return await prisma.ticket.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Ticket> {
    return await prisma.ticket.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.ticket.count();
  }

  async searchByName(query: string): Promise<Ticket[]> {
    return await prisma.ticket.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const ticketRepository = new TicketRepository();