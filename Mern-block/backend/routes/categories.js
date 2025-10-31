// routes/categories.js
import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories - return all categories
router.get('/', async (req, res, next) => {
  try {
    // Ensure default categories exist so frontend dropdown is never empty
    const defaults = ['Tech', 'Lifestyle', 'General', 'Business', 'Other'];

    // Create any missing default categories
    for (const name of defaults) {
      const slug = String(name).toLowerCase().replace(/\s+/g, '-');
      const existing = await Category.findOne({ slug });
      if (!existing) {
        await Category.create({ name, slug });
      }
    }

    const cats = await Category.find().sort('name');
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories - create a category (protected routes could be added)
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const slug = String(name).toLowerCase().replace(/\s+/g, '-');
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Category exists' });
    const cat = new Category({ name, slug });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
});

export default router;
