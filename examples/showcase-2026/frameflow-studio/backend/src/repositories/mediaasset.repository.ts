import { PrismaClient } from '@prisma/client';
import { MediaAsset } from '../models/mediaasset.model';

const prisma = new PrismaClient();

/**
 * Repository for MediaAsset entity
 */
export class MediaAssetRepository {

  async summarize(): Promise<{ total: number; byState: Record<string, number>; numericTotals: Record<string, number> }> {
    const grouping = prisma.mediaAsset.groupBy({ by: ['status'], _count: { _all: true } });
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

  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: MediaAsset[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.mediaAsset.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<MediaAsset | null> {
    return await prisma.mediaAsset.findUnique({
      where: { id },
    });
  }

  async create(
    data: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MediaAsset> {
    return await prisma.mediaAsset.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: Partial<MediaAsset>): Promise<MediaAsset> {
    return await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<MediaAsset> {
    return await prisma.mediaAsset.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await prisma.mediaAsset.count();
  }

  async searchByName(query: string): Promise<MediaAsset[]> {
    return await prisma.mediaAsset.findMany({
      where: {
        name: {
          contains: query,
        },
      },
    });
  }
}

export const mediaassetRepository = new MediaAssetRepository();