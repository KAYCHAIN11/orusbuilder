import { PrismaClient } from '@prisma/client';
import { Patient } from '../models/patient.model';

const prisma = new PrismaClient();

/**
 * Repository for Patient entity
 */
export class PatientRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.patient.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Patient[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.patient.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Patient> {
    return await prisma.patient.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    return await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Patient> {
    return await prisma.patient.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.patient.count();
  }

  async searchByName(query: string): Promise<Patient[]> {
    return await prisma.patient.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const patientRepository = new PatientRepository();