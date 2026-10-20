import { PrismaClient } from '@prisma/client';
import { Approval } from '../models/approval.model';

const prisma = new PrismaClient();

/**
 * Repository for Approval entity
 */
export class ApprovalRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.approval.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Approval[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.approval.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Approval | null> {
    return await prisma.approval.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Approval, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Approval> {
    return await prisma.approval.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Approval>): Promise<Approval> {
    return await prisma.approval.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Approval> {
    return await prisma.approval.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.approval.count();
  }

  async searchByName(query: string): Promise<Approval[]> {
    return await prisma.approval.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const approvalRepository = new ApprovalRepository();