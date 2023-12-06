const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
})

const Users = mongoose.model('Users', userSchema)

module.exports = Users;