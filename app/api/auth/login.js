// pages/api/auth/login.js

import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { BADGES } from '../../../lib/badges';
import dayjs from 'dayjs'; // Great for date manipulation
import bcrypt from 'bcryptjs'; // Assuming you use bcrypt for hashing

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- BADGE LOGIC STARTS HERE ---

    const today = dayjs().startOf('day');
    const lastLoginDate = user.lastLogin ? dayjs(user.lastLogin).startOf('day') : null;
    let consecutiveDays = user.consecutiveLoginDays;

    if (lastLoginDate) {
      // Check if the last login was yesterday
      if (today.diff(lastLoginDate, 'day') === 1) {
        consecutiveDays += 1;
      } 
      // Check if the last login was NOT today (to prevent multiple increments in one day)
      else if (!today.isSame(lastLoginDate)) {
        // If they missed a day, reset the streak
        consecutiveDays = 1;
      }
    } else {
      // First login ever for this user
      consecutiveDays = 1;
    }

    // Update user's login streak and last login date
    user.consecutiveLoginDays = consecutiveDays;
    user.lastLogin = today.toDate();

    // Check if the user has earned any new badges
    BADGES.forEach(badge => {
      if (user.consecutiveLoginDays >= badge.daysRequired && !user.badges.includes(badge.name)) {
        user.badges.push(badge.name);
        // You could add a notification field here if you want to show a popup on the frontend
        // e.g., user.newlyEarnedBadges.push(badge.name);
      }
    });

    await user.save();
    
    // --- BADGE LOGIC ENDS HERE ---

    // Don't send the password back to the client
    user.password = undefined;

    res.status(200).json({ message: 'Login successful', user });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}