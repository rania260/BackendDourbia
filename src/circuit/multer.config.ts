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
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new Error('Seules les images sont autorisées!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
