import { PrismaClient } from '@prisma/client';
import { Student } from '../models/student.model';

const prisma = new PrismaClient();

/**
 * Repository for Student entity
 */
export class StudentRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.student.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Student[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.student.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Student | null> {
    return await prisma.student.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Student> {
    return await prisma.student.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Student>): Promise<Student> {
    return await prisma.student.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Student> {
    return await prisma.student.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.student.count();
  }

  async searchByName(query: string): Promise<Student[]> {
    return await prisma.student.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const studentRepository = new StudentRepository();