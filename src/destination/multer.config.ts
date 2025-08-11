import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerDestinationOptions = {
  storage: diskStorage({
    destination: './uploads/destinations',
    filename: (req, file, callback) => {
      const uniqueName = uuidv4();
      const ext = extname(file.originalname);
      callback(null, `${uniqueName}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB pour les images de destinations
  },
};
