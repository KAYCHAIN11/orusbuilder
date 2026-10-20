import { PrismaClient } from '@prisma/client';
import { Scene } from '../models/scene.model';

const prisma = new PrismaClient();

/**
 * Repository for Scene entity
 */
export class SceneRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.scene.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Scene[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.scene.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.scene.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<Scene | null> {
    return await prisma.scene.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Scene> {
    return await prisma.scene.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<Scene>): Promise<Scene> {
    return await prisma.scene.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Scene> {
    return await prisma.scene.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.scene.count();
  }

  async searchByName(query: string): Promise<Scene[]> {
    return await prisma.scene.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const sceneRepository = new SceneRepository();