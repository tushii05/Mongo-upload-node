const mongoose = require('mongoose');
const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect('mongodb://127.0.0.1:27017/videoMongo', connectionOptions);
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('MongoDB connection successful');
});

const users = require('../modules/users/users.model');
const reels = require('../modules/reels/reels.model');

module.exports = {
    users,
    reels,
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}