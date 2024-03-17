const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const qaSchema = new Schema({
    question: String,
    answer: {
        a1: String,
        a2: String,
        a3: String
    },
    correct: String,
})

const articleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    fullText: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        // required: true
    },
    passedCount: {
        type: String,
        default: '0'
    },
    passingTime: {
        type: String,
        default: '0',
        // required: true
    },
    questionsAndAnswers: {
        type: [qaSchema],
        _id: false
    }
})

const Articles = mongoose.model('Articles', articleSchema)

module.exports = Articles;