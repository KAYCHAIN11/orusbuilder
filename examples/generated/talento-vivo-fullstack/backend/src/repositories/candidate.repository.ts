import { PrismaClient } from '@prisma/client';
import { Candidate } from '../models/candidate.model';

const prisma = new PrismaClient();

/**
 * Repository for Candidate entity
 */
export class CandidateRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.candidate.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Candidate[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.candidate.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Candidate | null> {
    return await prisma.candidate.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Candidate> {
    return await prisma.candidate.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    return await prisma.candidate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Candidate> {
    return await prisma.candidate.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.candidate.count();
  }

  async searchByName(query: string): Promise<Candidate[]> {
    return await prisma.candidate.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const candidateRepository = new CandidateRepository();