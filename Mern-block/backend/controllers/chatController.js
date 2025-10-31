// controllers/chatController.js
import Message from '../models/Message.js';

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(50);  // Limit to last 50 messages for performance
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = new Message({
      content,
      author: req.user.id  // From auth middleware
    });
    await message.save();
    const populatedMessage = await Message.findById(message._id).populate('author', 'name');
    res.status(201).json(populatedMessage);
  } catch (err) {
    next(err);
  }
};