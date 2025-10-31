import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  likeComment,
  replyToComment,
  editComment,
  deleteComment,
} from '../controllers/postController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// __dirname replacement for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory
const uploadDir = path.join(path.dirname(__dirname), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created uploads directory at: ${uploadDir}`);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', auth, upload.single('featuredImage'), createPost);
router.put('/:id', auth, upload.single('featuredImage'), updatePost);
router.delete('/:id', auth, deletePost);

// Comment routes
router.post('/:id/comments', auth, addComment); // add comment
router.post('/:id/comments/:commentId/like', auth, likeComment); // like/unlike comment
router.post('/:id/comments/:commentId/reply', auth, replyToComment); // reply
router.put('/:id/comments/:commentId', auth, editComment); // edit comment
router.delete('/:id/comments/:commentId', auth, deleteComment); // delete comment

export default router;
