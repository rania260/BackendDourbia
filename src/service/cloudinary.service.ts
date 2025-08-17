import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'services',
  ): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `dourbia/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return result.secure_url;
    } catch (error) {
      throw new Error(`Erreur upload Cloudinary: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'services',
  ): Promise<string[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, folder)
    );
    
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Erreur suppression Cloudinary: ${error.message}`);
    }
  }

  // Extraire public_id depuis une URL Cloudinary
  extractPublicId(url: string): string {
    const parts = url.split('/');
    const fileWithExt = parts[parts.length - 1];
    const publicId = fileWithExt.split('.')[0];
    const folderPath = parts.slice(-3, -1).join('/');
    return `${folderPath}/${publicId}`;
  }
}
