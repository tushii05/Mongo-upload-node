const express = require('express');
const router = express.Router();

router.use('/users', require('../modules/users/users.controller'));
router.use('/reels', require('../modules/reels/reels.controller'));

module.exports = router;