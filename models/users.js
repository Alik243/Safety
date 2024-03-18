const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passedQaSchema = new Schema({
    name: String,
    test: String,
})

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    job: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    passedArticles: {
        type: [passedQaSchema],
        // _id: false
    }
})

const Users = mongoose.model('Users', userSchema)

module.exports = Users;