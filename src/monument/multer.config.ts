import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Configuration multer pour les images de monuments
export const monumentImageStorage = diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = './uploads/monuments';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = extname(file.originalname);
    callback(null, `monument-${uniqueSuffix}${fileExtension}`);
  },
});

// Filtre pour accepter seulement les images
export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new Error('Seuls les fichiers image sont autorisés!'),
      false,
    );
  }
  callback(null, true);
};
