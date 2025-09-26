import mongoose from 'mongoose';

// Defines the structure for a single flashcard within a set
const FlashcardSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    answer: {
        type: String,
        required: true,
        trim: true,
    },
});

// Defines the main structure for a study material document
const flashcardsMindmapSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'A topic is required for study materials.'],
        trim: true,
    },
    // Using mongoose.Schema.Types.Mixed allows us to store the
    // flexible, nested JSON structure of the mind map.
    mindMap: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    // Embeds an array of flashcards using the schema defined above
    flashcards: [FlashcardSchema],
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the creation date
    },
});

// Prevents Mongoose from recompiling the model on every hot-reload
export default mongoose.models.flashcardsMindmap || mongoose.model('flashcardsMindmap', flashcardsMindmapSchema);
