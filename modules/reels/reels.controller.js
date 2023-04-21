const express = require('express');
const router = express.Router();
const Reel = require('./reels.model');
const reelsService = require('./reels.service');
const Grid = require('gridfs-stream');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const conn = mongoose.createConnection(process.env.MONGO_URI);

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


//-----------------for array from-------------------------- 

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


async function getAll(req, res, next) {
    const { count = 0, limit = 5 } = req.query;
    // const totalCount = await Reel.countDocuments();

    // Calculate the skip and limit values based on the given count and limit
    const queryLimit = parseInt(limit);
    // const skip = Math.min(parseInt(count), totalCount); // Use Math.min to ensure skip doesn't exceed totalCount

    const skip = Math.max(0, parseInt(count) - 3); // Subtract 2 from count to get 2 data before count
    // Reel.find(req.query)
    Reel.find()
        .skip(skip)
        .limit(queryLimit)
        .then(data => res.json({ message: 'Success', data }))
        .catch(next);
}


//___________________for array from_________________________________

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
        .then(data => res.json({ message: 'Success', data }))
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
        .then(data => res.json({ message: 'Successful Deleted', data }))
        .catch(next);
}