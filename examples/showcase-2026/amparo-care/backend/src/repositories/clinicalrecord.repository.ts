import { PrismaClient } from '@prisma/client';
import { ClinicalRecord } from '../models/clinicalrecord.model';

const prisma = new PrismaClient();

/**
 * Repository for ClinicalRecord entity
 */
export class ClinicalRecordRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.clinicalRecord.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: ClinicalRecord[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.clinicalRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.clinicalRecord.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<ClinicalRecord | null> {
    return await prisma.clinicalRecord.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<ClinicalRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ClinicalRecord> {
    return await prisma.clinicalRecord.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<ClinicalRecord>): Promise<ClinicalRecord> {
    return await prisma.clinicalRecord.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<ClinicalRecord> {
    return await prisma.clinicalRecord.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.clinicalRecord.count();
  }

  async searchByName(query: string): Promise<ClinicalRecord[]> {
    return await prisma.clinicalRecord.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const clinicalrecordRepository = new ClinicalRecordRepository();