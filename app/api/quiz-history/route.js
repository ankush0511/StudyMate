import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Quiz from '../../../models/Quiz';

/**
 * Handles GET requests to fetch all quiz history.
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} - A response object with the quiz history or an error.
 */
export async function GET(request) {
    try {
        await dbConnect();

        // Find all quiz documents and sort them by creation date (newest first)
        const quizzes = await Quiz.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, history: quizzes });

    } catch (error) {
        console.error("Error fetching quiz history:", error);
        // Return a 500 Internal Server Error response
        return NextResponse.json({ success: false, error: 'Server error while fetching history.' }, { status: 500 });
    }
}

/**
 * Handles POST requests to save a new quiz result.
 * @param {Request} request - The incoming request object containing the quiz data.
 * @returns {NextResponse} - A response object with the saved quiz or an error.
 */
export async function POST(request) {
    try {
        await dbConnect();
        
        // Get the quiz data from the request body
        const body = await request.json();
        
        // Create a new quiz document in the database
        const quiz = await Quiz.create(body);

        // Return a 201 Created response with the new quiz data
        return NextResponse.json({ success: true, savedQuiz: quiz }, { status: 201 });

    } catch (error) {
        console.error("Error saving quiz:", error);
        // Return a 400 Bad Request response if data is invalid or saving fails
        return NextResponse.json({ success: false, error: 'Server error while saving quiz.' }, { status: 400 });
    }
}
