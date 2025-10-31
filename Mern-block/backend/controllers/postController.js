import Post from '../models/Post.js';
import Category from '../models/Category.js';

// Helper: slugify
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ========== GET POSTS ==========
export const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category, excludeAuthor, onlyAuthor } = req.query;
    const query = {};

    if (excludeAuthor) query.author = { $ne: excludeAuthor };
    else if (onlyAuthor) query.author = onlyAuthor;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ data: posts, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
};

// ========== GET POST BY ID ==========
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate('category', 'name slug')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// ========== CREATE POST ==========
export const createPost = async (req, res, next) => {
  try {
    const { title } = req.body;
    const content = req.body.content ?? req.body.body ?? '';
    let rawCategories = req.body.categories ?? req.body.category ?? [];
    let category = undefined;

    if (typeof rawCategories === 'string') {
      try {
        const parsed = JSON.parse(rawCategories);
        category = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        category = rawCategories;
      }
    } else if (Array.isArray(rawCategories)) category = rawCategories[0];
    else if (rawCategories) category = rawCategories;

    const featuredImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    const slug = slugify(title);

    const newPost = new Post({
      title,
      slug,
      content,
      author: req.user.id,
      category,
      featuredImage,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

// ========== UPDATE POST ==========
export const updatePost = async (req, res, next) => {
  try {
    const { title } = req.body;
    const content = req.body.content ?? req.body.body;
    let rawCategories = req.body.categories ?? req.body.category ?? [];
    let category = undefined;

    if (typeof rawCategories === 'string') {
      try {
        const parsed = JSON.parse(rawCategories);
        category = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        category = rawCategories;
      }
    } else if (Array.isArray(rawCategories)) category = rawCategories[0];
    else if (rawCategories) category = rawCategories;

    const update = { title, updatedAt: new Date() };
    if (content !== undefined) update.content = content;
    if (category !== undefined) update.category = category;
    if (title) update.slug = slugify(title);
    if (req.file) update.featuredImage = `/uploads/${req.file.filename}`;

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// ========== DELETE POST ==========
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// ========== ADD COMMENT ==========
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!req.user?.id) return res.status(401).json({ message: 'Authentication required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });

    post.comments.push({ user: req.user.id, content, likes: [], replies: [] });
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    res.status(201).json(populatedPost);
  } catch (err) {
    next(err);
  }
};

// ========== LIKE/UNLIKE COMMENT ==========
export const likeComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const index = comment.likes.indexOf(userId);
    if (index === -1) comment.likes.push(userId);
    else comment.likes.splice(index, 1);

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    res.json(populatedPost);
  } catch (err) {
    next(err);
  }
};

// ========== REPLY TO COMMENT ==========
export const replyToComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.replies.push({ user: userId, content });
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    res.status(201).json(populatedPost);
  } catch (err) {
    next(err);
  }
};

// ========== EDIT COMMENT ==========
export const editComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    comment.content = content;
    comment.updatedAt = new Date();

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    res.json(populatedPost);
  } catch (err) {
    next(err);
  }
};

// ========== DELETE COMMENT ==========
export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId && post.author.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    comment.remove();
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    res.json(populatedPost);
  } catch (err) {
    next(err);
  }
};
