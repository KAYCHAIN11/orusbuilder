export interface FileAsset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type FileAssetCreateInput = Omit<FileAsset, 'id' | 'createdAt' | 'updatedAt'>;
export type FileAssetUpdateInput = Partial<FileAssetCreateInput>;