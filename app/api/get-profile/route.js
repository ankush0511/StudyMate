import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "../../../lib/dbConnect";
import UserProfile from "../../../models/UserProfile";
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    const userProfile = await UserProfile.findOne({ email: session.user.email }).lean();

    if (!userProfile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }
    
    // Convert Buffer to base64 string if profile picture exists
    if (userProfile.profilePicture && userProfile.profilePicture.data) {
        userProfile.profilePictureUrl = `data:${userProfile.profilePicture.contentType};base64,${userProfile.profilePicture.data.toString('base64')}`;
        delete userProfile.profilePicture; // Don't send the large buffer data
    }

    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error("API Error fetching profile:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
