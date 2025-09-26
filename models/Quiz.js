import mongoose from 'mongoose';

// Defines the structure for each question within a quiz
const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: Map,
        of: String,
        required: true,
    },
    correct_answer: {
        type: String,
        required: true,
    },
    explanation: {
        type: String,
        default: 'No explanation provided.',
    },
});

// Defines the main structure for a completed quiz document
const QuizHistorySchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Quiz topic is required.'],
        trim: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    // Embeds an array of questions using the schema defined above
    questions: [QuestionSchema],
    // Stores the user's answers as a map, e.g., { "What is 2+2?": "B" }
    userAnswers: {
        type: Map,
        of: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the date when a quiz is created
    },
    // Optional: If you add user accounts later, you can link quizzes to users
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true
    // }
});

// This line prevents Mongoose from recompiling the model on every hot-reload
// in a development environment, which can cause errors.
export default mongoose.models.Quiz || mongoose.model('Quiz', QuizHistorySchema);
