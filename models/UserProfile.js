import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  // We use email as the unique link to the NextAuth user
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  phone: String,
  experience: String,
  desiredRole: String,
  onlinePresence: {
    linkedin: String,
    github: String,
    portfolio: String,
  },
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);