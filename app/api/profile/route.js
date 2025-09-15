import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth"; // Adjust path to your NextAuth route handler
import dbConnect from '../../../lib/dbConnect'; // Adjust path based on your lib folder location
import UserProfile from '../../../models/UserProfile'; // Adjust path based on your models folder location

export async function POST(request) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. Connect to the database
  await dbConnect();

  try {
    // 3. Parse the multipart form data from the request
    const data = await request.formData();
    
    // Prepare the data object for the database
    const profileData = {
      fullName: data.get('fullName'),
      location: data.get('location'),
      phone: data.get('phone'),
      experience: data.get('experience'),
      desiredRole: data.get('desiredRole'),
      onlinePresence: {
        linkedin: data.get('linkedin'),
        github: data.get('github'),
        portfolio: data.get('portfolio'),
      },
    };

    // 4. Handle the profile picture file upload
    const profilePictureFile = data.get('profilePicture');
    if (profilePictureFile && profilePictureFile.size > 0) {
      // Convert file to a Buffer
      const fileBuffer = Buffer.from(await profilePictureFile.arrayBuffer());
      profileData.profilePicture = {
        data: fileBuffer,
        contentType: profilePictureFile.type,
      };
    }
    
    // 5. Save to database using email as the unique identifier
    // `findOneAndUpdate` with `upsert: true` will create a profile if it doesn't exist, or update it if it does.
    const updatedProfile = await UserProfile.findOneAndUpdate(
        { email: session.user.email },
        { $set: profileData },
        { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully!', data: updatedProfile }, { status: 200 });
    
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ success: false, message: 'A server error occurred.' }, { status: 500 });
  }
}