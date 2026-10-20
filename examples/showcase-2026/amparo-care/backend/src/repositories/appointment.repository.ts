import { PrismaClient } from '@prisma/client';
import { Appointment } from '../models/appointment.model';

const prisma = new PrismaClient();

/**
 * Repository for Appointment entity
 */
export class AppointmentRepository {

  async findScheduleCandidates(professional: string, scheduledAt: Date, excludeId?: string): Promise<Appointment[]> {
    const from = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000);
    const to = new Date(scheduledAt.getTime() + 24 * 60 * 60 * 1000);
    return prisma.appointment.findMany({
      where: {
        professional,
        status: { not: 'cancelled' },
        scheduledAt: { gte: from, lte: to },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } });
    const [groups, totals] = await prisma.$transaction([
      grouping,
      prisma.appointment.aggregate({ _sum: { durationMinutes: true } }),
    ]);
    const byState: Record<string, number> = {};
    let total = 0;
    for (const group of groups) {
      byState[String(group.status)] = group._count._all;
      total += group._count._all;
    }
    const numericTotals: Record<string, number> = { durationMinutes: Number(totals._sum.durationMinutes ?? 0) };
    return { total, byState, numericTotals };
  }

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Appointment[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.appointment.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Appointment | null> {
    return await prisma.appointment.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment> {
    return await prisma.appointment.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Appointment> {
    return await prisma.appointment.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.appointment.count();
  }

  async searchByName(query: string): Promise<Appointment[]> {
    return await prisma.appointment.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const appointmentRepository = new AppointmentRepository();