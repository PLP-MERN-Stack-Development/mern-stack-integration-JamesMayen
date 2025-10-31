import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Load .env from backend folder
dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/setPassword.js <email> <newPassword>');
    process.exit(1);
  }

  const [email, newPassword] = args;
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error(`User not found for email=${normalizedEmail}`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    // remove legacy password field if present
    if (user.password) user.password = undefined;

    await user.save();

    console.log(`Successfully updated password for user id=${user._id} email=${normalizedEmail}`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting password:', err);
    process.exit(1);
  }
}

main();
