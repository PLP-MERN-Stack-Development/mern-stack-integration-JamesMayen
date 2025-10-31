// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  // store hashed password as `passwordHash` to match auth controller usage
  passwordHash: { type: String, required: true },
  // optional avatar/profile image path (can be a URL or an uploads path)
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

export default mongoose.model('User', UserSchema);
