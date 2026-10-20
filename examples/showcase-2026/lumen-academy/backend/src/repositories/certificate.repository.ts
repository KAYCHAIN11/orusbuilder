import { PrismaClient } from '@prisma/client';
import { Certificate } from '../models/certificate.model';

const prisma = new PrismaClient();

/**
 * Repository for Certificate entity
 */
export class CertificateRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.certificate.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Certificate[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.certificate.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Certificate | null> {
    return await prisma.certificate.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Certificate> {
    return await prisma.certificate.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Certificate>): Promise<Certificate> {
    return await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Certificate> {
    return await prisma.certificate.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.certificate.count();
  }

  async searchByName(query: string): Promise<Certificate[]> {
    return await prisma.certificate.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const certificateRepository = new CertificateRepository();