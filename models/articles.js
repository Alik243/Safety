const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const qaSchema = new Schema({
    question: String,
    answer: String,
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
    questionsAndAnswers: [qaSchema]
})

const Articles = mongoose.model('Articles', articleSchema)

module.exports = Articles;