const mongoose = require('mongoose');


const reelsSchema = new mongoose.Schema({

    //for array from 

    // videos: [{
    //     filename: { type: String, required: true },
    //     url: { type: String, required: true }
    // }],

    filename: { type: String, required: true },
    url: { type: String, required: true },
    count: { type: Number, required: true }
}, {
    timestamps: true,   //_____________for Created_At Time Updated_At Time___________________
    toJSON: {
        transform: function (doc, ret) {
            delete ret.hash;
            delete ret.__v;
        }
    }
});

module.exports = mongoose.model('reels', reelsSchema);