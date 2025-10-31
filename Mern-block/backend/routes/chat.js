// routes/chat.js
import express from 'express';
import { getMessages, createMessage } from '../controllers/chatController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/', auth, createMessage);

export default router;