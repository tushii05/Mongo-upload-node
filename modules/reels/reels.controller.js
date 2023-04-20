const express = require('express');
const router = express.Router();
const Reel = require('./reels.model');
const reelsService = require('./reels.service');
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');
const Grid = require('gridfs-stream');
const multer = require('multer');
const mongoose = require('mongoose');


// const ASSET_URL = "http://192.168.1.34:5050"
// const conn = mongoose.createConnection("mongodb://127.0.0.1:27017/videoMongo");

const conn = mongoose.createConnection(process.env.MONGO_URI);

// Initialize GridFS
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('reels');
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/reels");
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + "-" + file.originalname.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        cb(null, fileName);
    }
});




const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            return cb('Only video formats allowed!', false);
        }
    }
});

function uploadVideo(req, res, next) {
    const cpUpload = upload.single('video');
    cpUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: JSON.stringify(err) });
        } else if (err) {
            return res.status(400).json({ message: err });
        }
        req.file = req.file;
        next();
    });
}


//for array from 

// function uploadVideo(req, res, next) {
//     const cpUpload = upload.array('videos', 5);
//     cpUpload(req, res, function (err) {
//         if (err instanceof multer.MulterError) {
//             return res.status(400).json({ message: JSON.stringify(err) });
//         } else if (err) {
//             return res.status(400).json({ message: err });
//         }
//         next();
//     });
// }




router.get('/', getAll);
router.post('/store', uploadVideo, store);
router.get('/:id', getById);
router.put('/:id', uploadVideo, update);
router.delete('/:id', _delete);
module.exports = router;



// function getAll(req, res, next) {
//     Reel.find(req.query)
//         .then(data => res.json({ message: 'Success', data }))
//         .catch(next);
// }

// async function getAll(req, res, next) {
//     const { count = 0, limit = 5 } = req.query;
//     const totalCount = await Reel.countDocuments();

//     // Calculate the skip and limit values based on the given count and limit
//     const skip = Math.min(parseInt(count), totalCount); // Use Math.min to ensure skip doesn't exceed totalCount
//     const queryLimit = parseInt(limit);

//     Reel.find()
//         .skip(skip)
//         .limit(queryLimit)
//         .then(data => res.json({ message: 'Success', data }))
//         .catch(next);
// }

async function getAll(req, res, next) {
    const { count = 0, limit = 5 } = req.query;
    const totalCount = await Reel.countDocuments();

    // Calculate the skip and limit values based on the given count and limit
    const queryLimit = parseInt(limit);
    const skip = Math.max(0, parseInt(count) - 2); // Subtract 2 from count to get 2 data before count

    Reel.find()
        .skip(skip)
        .limit(queryLimit)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}








//for array from 

// function store(req, res, next) {
//     const videos = [];
//     if (req.files) {
//         req.files.forEach(file => {
//             videos.push({
//                 filename: file.filename,
//                 url: `${ASSET_URL}/reels/${file.filename}`
//             });
//         });
//     }
//     req.body.videos = videos;
//     req.body.url = `${ASSET_URL}/reels/${req.files[0].filename}`;
//     Reel.create(req.body)
//         .then(data => { res.json({ message: 'Success', data }) })
//         .catch(next);
// }




async function store(req, res, next) {
    if (req.file) {
        const file = req.file;
        req.body.filename = file.filename;
        req.body.url = `${process.env.ASSET_URL}/reels/${file.filename}`;
    }
    const currentCount = await Reel.countDocuments();
    req.body.count = currentCount + 1;
    Reel.create(req.body)
        .then(data => { res.json({ message: 'Success', data }) })
        .catch(next);
}





function getById(req, res, next) {
    reelsService.findById(req.params.id)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}


async function update(req, res, next) {
    try {
        const reelId = req.params.id;
        let reel = await Reel.findById(reelId);
        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }
        if (req.file) {
            const file = req.file;
            req.body.filename = file.filename;
            req.body.url = `${process.env.ASSET_URL}/reels/${file.filename}`;
        }
        reel = await Reel.findByIdAndUpdate(reelId, req.body, { new: true });
        res.json({ message: 'Success', data: reel });
    } catch (error) {
        next(error);
    }
}


function _delete(req, res, next) {
    Reel.findByIdAndDelete(req.params.id)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}



//Helper

// const crypto = require('crypto');

// function encryptData(data) {
//     // Replace with your desired encryption algorithm and secret key
//     const algorithm = 'aes-128-cbc';
//     const secretKey = crypto.randomBytes(16); // Generate a secret key of 16 bytes (128 bits)

//     const iv = crypto.randomBytes(16); // Generate a random IV (initialization vector)
//     const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
//     const encryptedData = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);

//     // Return the encrypted data, secret key, and IV as hex strings
//     return {
//         iv: iv.toString('hex'),
//         encryptedData: encryptedData.toString('hex'),
//         secretKey: secretKey.toString('hex') // Convert the secret key to a hex string
//     };
// }

// function getById(req, res, next) {
//     reelsService.findById(req.params.id)
//         .then(data => {
//             const dataString = data.toString(); // Convert data to a string
//             const encryptedData = encryptData(dataString.slice(0, 5)); // Encrypt the first 10 characters of the data
//             const shareLink = `http://192.168.1.34:5050/api/reels/${encryptedData.iv}/${encryptedData.encryptedData}/${encryptedData.secretKey}`;
//             res.json({ message: 'Success', shareLink });
//         })
//         .catch(next);
// }


// function encryptData(data) {
//     // Replace with your desired encryption algorithm and secret key
//     const algorithm = 'aes-128-cbc';
//     const secretKey = crypto.randomBytes(16); // Generate a secret key of 16 bytes (128 bits)

//     const iv = crypto.randomBytes(16); // Generate a random IV (initialization vector)
//     const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
//     const encryptedData = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);

//     // Return the encrypted data, secret key, and IV as hex strings
//     return {
//         iv: iv.toString('hex'),
//         encryptedData: encryptedData.toString('hex'),
//         secretKey: secretKey.toString('hex') // Convert the secret key to a hex string
//     };
// }

// function getById(req, res, next) {
//     reelsService.findById(req.params.id)
//         .then(data => {
//             const encryptedData = encryptData(data.toString()); // Encrypt the entire data string
//             const shareLink = `http://192.168.1.34:5050/api/reels/${encryptedData.iv}/${encryptedData.encryptedData}/${encryptedData.secretKey}`;
//             res.json({ message: 'Success', shareLink });
//         })
//         .catch(next);
// }