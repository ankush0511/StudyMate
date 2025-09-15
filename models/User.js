// models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // --- ADD THESE NEW FIELDS ---
  lastLogin: {
    type: Date,
    default: null,
  },
  consecutiveLoginDays: {
    type: Number,
    default: 0,
  },
  badges: {
    type: [String], // An array of badge names
    default: [],
  },
  // --- END OF NEW FIELDS ---
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);