const db = require('../../config/db');
const dotenv = require('dotenv');
dotenv.config();
const Reel = require("./reels.model");


module.exports = {
    getAll,
    findById,
    create,
    update,
    _delete
};

// async function getAll({ offset = 0, limit = 100, orderBy = 'id', orderType = 'desc', search = null }) {
//     const regex = new RegExp(search, 'i');
//     const reels = await Reel.find({ name: regex })
//         .skip(parseInt(offset))
//         .limit(parseInt(limit))
//         .sort({ [orderBy]: orderType });
//     return reels;
// }
async function getAll({ offset = 0, limit = 100, orderBy = 'id', orderType = 'desc', search = null }) {
    const regex = new RegExp(search, 'i');
    const reels = await Reel.find({ name: regex })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .sort({ [orderBy]: orderType });
    return reels;
}

async function create(params) {
    const reel = new db.reels(params);
    const savedReel = await reel.save();
    return savedReel;
}

async function update(id, params) {
    const updatedReel = await Reel.findByIdAndUpdate(id, params, { new: true });
    if (!updatedReel) throw 'Reel not found';
    return updatedReel;
}

async function findById(id) {
    const reel = await Reel.findById(id);
    if (!reel) throw 'Reel not found';
    return reel;
}


async function _delete(id) {
    const deletedReel = await Reel.findByIdAndDelete(id);
    if (!deletedReel) throw 'Reel not found';
    return true;
}