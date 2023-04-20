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



function getAll(req, res, next) {
    Reel.find(req.query)
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



function store(req, res, next) {
    if (req.file) {
        const file = req.file;
        req.body.filename = file.filename;
        req.body.url = `${process.env.ASSET_URL}/reels/${file.filename}`;
    }

    Reel.create(req.body)
        .then(data => { res.json({ message: 'Success', data }) })
        .catch(next);
}



function getById(req, res, next) {
    reelsService.findById(req.params.id)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}


function update(req, res, next) {
    if (req.file) {
        req.body.file = `${ASSET_URL}/reels/${req.file.filename}`;
    }
    Reel.findByIdAndUpdate(req.params.id, req.body)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}

function _delete(req, res, next) {
    Reel.findByIdAndDelete(req.params.id)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}
