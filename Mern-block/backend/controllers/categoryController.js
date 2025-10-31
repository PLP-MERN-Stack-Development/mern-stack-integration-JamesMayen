const Category = require('../models/Category');

// get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find().sort('name');
    res.json(cats);
  } catch (err) { next(err); }
};

// create category
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Category exists' });
    const cat = new Category({ name, slug });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) { next(err); }
};
