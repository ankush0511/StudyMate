import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import FlashcardsMindmap from '../../../models/flashcards_mindmap';
import mongoose from 'mongoose';

/**
 * Handles GET requests to fetch all study material history.
 */
export async function GET(request) {
    try {
        await dbConnect();
        const materials = await FlashcardsMindmap.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, history: materials });
    } catch (error) {
        console.error("Error fetching study materials:", error);
        return NextResponse.json({ success: false, error: 'Server error while fetching history.' }, { status: 500 });
    }
}

/**
 * Handles POST requests to save a new set of study materials.
 */
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        // Mind map is optional, but topic and flashcards are required for new sets
        if (!body.topic || !body.flashcards) {
            return NextResponse.json({ success: false, error: 'Missing required fields: topic or flashcards.' }, { status: 400 });
        }

        const newMaterial = await FlashcardsMindmap.create(body);
        
        return NextResponse.json({ success: true, savedMaterial: newMaterial }, { status: 201 });

    } catch (error) {
        console.error("Error saving study material:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
    }
}

/**
 * Handles PUT requests to update a topic name and/or its flashcards.
 */
export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, topic, flashcards } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing document ID.' }, { status: 400 });
        }

        if (!topic && !flashcards) {
            return NextResponse.json({ success: false, error: 'Missing topic or flashcards data for update.' }, { status: 400 });
        }

        const updatePayload = { $set: {} };
        if (topic) updatePayload.$set.topic = topic;
        if (flashcards) updatePayload.$set.flashcards = flashcards;

        const updatedMaterial = await FlashcardsMindmap.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!updatedMaterial) {
            return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, updatedMaterial: updatedMaterial }, { status: 200 });

    } catch (error) {
        console.error("--- ERROR UPDATING STUDY MATERIAL ---", error);
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
    }
}