import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, join(process.cwd(), 'uploads', 'services'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4();
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
