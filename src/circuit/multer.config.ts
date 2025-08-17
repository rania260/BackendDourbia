import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerCircuitOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/circuits',
    filename: (req, file, callback) => {
      const uniqueSuffix = uuidv4();
      const fileExtension = extname(file.originalname);
      const fileName = `${uniqueSuffix}${fileExtension}`;
      callback(null, fileName);
    },
  }),
  fileFilter: (req, file, callback) => {
    // Accepter les images et les audios
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp3|wav|ogg|m4a|aac)$/)) {
      callback(null, true);
    } else {
      return callback(new Error('Seules les images et audios sont autorisés!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB pour permettre les fichiers audio
  },
};
