// models/Category.js
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // adds updatedAt automatically
);

// Pre-save hook to generate slug from name
CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  next();
});

export default mongoose.model('Category', CategorySchema);
