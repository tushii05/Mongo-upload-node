const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: false },
    password: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret.hash;
            delete ret.__v;
        }
    }
});

module.exports = mongoose.model('users', userSchema);
