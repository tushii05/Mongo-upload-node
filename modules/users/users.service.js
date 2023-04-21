const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const db = require('../../config/db');

module.exports = {
    register,
    authenticate
};


async function register(params) {
    if (await db.users.findOne({ email: params.email })) {
        throw new Error('Email already registered. Please use a different email address.');
    }
    const users = new db.users(params);
    const hash = await bcrypt.hash(params.password, 10);
    users.password = hash;
    const user = await users.save();
    return user;
}


async function authenticate({ email, password }) {
    const users = new MongoClient(process.env.MONGO_URI);
    await users.connect();
    const db = users.db('videoMongo');
    const collection = db.collection('users');
    const user = await collection.findOne({ email });
    if (!user) {
        throw 'Email not match please first Registration';
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw 'Password is incorrect';
    }
    const token = jwt.sign({ sub: user._id.toString() }, process.env.SECRETSTRING, { expiresIn: '7d' });
    return { ...user, token };
}