const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const db = require('../../config/db');


const uri = "mongodb://127.0.0.1:27017/videoMongo";
const SECRETSTRING = "vbobivnksanvdflbls1313vnvnlnVGVb6s8fgb6s1fg6bs1gf6bsg1s65gfb1sgf"


module.exports = {
    register,
    authenticate
};


async function register(params) {
    try {
        const account = new db.users(params);
        if (params.password) {
            account.passwordHash = await hash(params.password);
        } else {
            throw new Error('Password is required.');
        }
        const savedAccount = await account.save();
        console.log(savedAccount, "----")
    } catch (error) {
        throw error;
    }
    async function hash(password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            throw error;
        }
    }
}



async function authenticate({ email, password }) {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('videoMongo');
    const collection = db.collection('users');
    const user = await collection.findOne({ email });
    if (!user || user.password !== password) {
        throw 'Password is incorrect';
    }
    const token = jwt.sign({ sub: user._id.toString() }, SECRETSTRING, { expiresIn: '1d' });
    return { ...user, token };
}