import { PrismaClient } from '@prisma/client';
import { Emprestimo } from '../models/emprestimo.model';

const prisma = new PrismaClient();

/**
 * Repository for Emprestimo entity
 */
export class EmprestimoRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.emprestimo.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Emprestimo[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.emprestimo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.emprestimo.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Emprestimo | null> {
    return await prisma.emprestimo.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Emprestimo, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Emprestimo> {
    return await prisma.emprestimo.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Emprestimo>): Promise<Emprestimo> {
    return await prisma.emprestimo.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Emprestimo> {
    return await prisma.emprestimo.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.emprestimo.count();
  }

  async searchByName(query: string): Promise<Emprestimo[]> {
    return await prisma.emprestimo.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const emprestimoRepository = new EmprestimoRepository();