const express = require('express');
const { markObservationReviewed } = require('../controllers/observations');
const router = express.Router();

router.patch('/:id/reviewed', markObservationReviewed);

module.exports = router;