import { PrismaClient } from '@prisma/client';
import { Invoice } from '../models/invoice.model';

const prisma = new PrismaClient();

/**
 * Repository for Invoice entity
 */
export class InvoiceRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.invoice.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.invoice.aggregate({ _sum: { amount: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { amount: Number(totals._sum.amount ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Invoice[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.invoice.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Invoice | null> {
    return await prisma.invoice.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Invoice> {
    return await prisma.invoice.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Invoice> {
    return await prisma.invoice.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.invoice.count();
  }

  async searchByName(query: string): Promise<Invoice[]> {
    return await prisma.invoice.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const invoiceRepository = new InvoiceRepository();