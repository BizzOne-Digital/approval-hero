import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import sharp from 'sharp';
import { env } from '../config/env';
import { MediaAsset } from '../models';
import { logger } from '../utils/logger';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_BASE = path.resolve(process.cwd(), env.UPLOAD_DIR);

const FOLDER_MAP: Record<string, string> = {
  pages: 'pages',
  services: 'services',
  gallery: 'gallery',
  testimonials: 'testimonials',
  blogs: 'blogs',
  branding: 'branding',
  temp: 'temp',
};

export interface ProcessedImage {
  filename: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export interface IStorageService {
  processUpload(file: Express.Multer.File, folder: string): Promise<ProcessedImage>;
  deleteFile(filename: string, folder: string): Promise<void>;
  safeDeleteByMediaId(mediaAssetId: string): Promise<void>;
  incrementReference(mediaAssetId: string): Promise<void>;
  decrementReference(mediaAssetId: string): Promise<void>;
}

function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.webp';
  return `${crypto.randomUUID()}${safeExt}`;
}

function getFolderPath(folder: string): string {
  const mapped = FOLDER_MAP[folder] || 'temp';
  return path.join(UPLOAD_BASE, mapped);
}

function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

function preventPathTraversal(filename: string): string {
  const sanitized = path.basename(filename);
  if (sanitized !== filename || filename.includes('..')) {
    throw new Error('Invalid filename');
  }
  return sanitized;
}

export class LocalStorageService implements IStorageService {
  async processUpload(file: Express.Multer.File, folder: string): Promise<ProcessedImage> {
    if (!validateMimeType(file.mimetype)) {
      throw new Error('Unsupported file type. Only JPEG, PNG and WebP are allowed.');
    }

    const folderPath = getFolderPath(folder);
    await fs.mkdir(folderPath, { recursive: true });

    const filename = generateSafeFilename(file.originalname);
    const filePath = path.join(folderPath, filename);
    const thumbFilename = `thumb_${filename.replace(/\.[^.]+$/, '.webp')}`;
    const thumbPath = path.join(folderPath, thumbFilename);

    const mappedFolder = FOLDER_MAP[folder] || 'temp';
    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    const needsConversion = file.mimetype !== 'image/webp' || (metadata.width && metadata.width > 1920);
    const outputFilename = needsConversion ? filename.replace(/\.[^.]+$/, '.webp') : filename;
    const outputPath = path.join(folderPath, outputFilename);

    if (needsConversion) {
      await sharp(file.buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);
    } else {
      await fs.writeFile(outputPath, file.buffer);
    }

    await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    const stats = await fs.stat(outputPath);
    const finalMeta = await sharp(outputPath).metadata();

    return {
      filename: outputFilename,
      url: `/uploads/${mappedFolder}/${outputFilename}`,
      thumbnailUrl: `/uploads/${mappedFolder}/${thumbFilename}`,
      width: finalMeta.width || 0,
      height: finalMeta.height || 0,
      size: stats.size,
      mimeType: needsConversion ? 'image/webp' : file.mimetype,
    };
  }

  async deleteFile(filename: string, folder: string): Promise<void> {
    const safeFilename = preventPathTraversal(filename);
    const folderPath = getFolderPath(folder);
    const filePath = path.join(folderPath, safeFilename);
    const thumbPath = path.join(folderPath, `thumb_${safeFilename.replace(/\.[^.]+$/, '.webp')}`);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      logger.warn(`Could not delete file: ${filePath}`);
    }
    try {
      await fs.unlink(thumbPath);
    } catch {
      // thumbnail may not exist
    }
  }

  async safeDeleteByMediaId(mediaAssetId: string): Promise<void> {
    const asset = await MediaAsset.findById(mediaAssetId);
    if (!asset) return;

    if (asset.referenceCount > 0) {
      logger.info(`Skipping delete for ${mediaAssetId}, reference count: ${asset.referenceCount}`);
      return;
    }

    await this.deleteFile(asset.filename, asset.folder);
    await MediaAsset.findByIdAndDelete(mediaAssetId);
  }

  async incrementReference(mediaAssetId: string): Promise<void> {
    await MediaAsset.findByIdAndUpdate(mediaAssetId, { $inc: { referenceCount: 1 } });
  }

  async decrementReference(mediaAssetId: string): Promise<void> {
    const asset = await MediaAsset.findByIdAndUpdate(
      mediaAssetId,
      { $inc: { referenceCount: -1 } },
      { new: true }
    );
    if (asset && asset.referenceCount <= 0) {
      await this.safeDeleteByMediaId(mediaAssetId);
    }
  }
}

export const storageService = new LocalStorageService();
