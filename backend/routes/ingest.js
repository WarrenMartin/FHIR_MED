const express = require('express');
const { validateVitalsPayload } = require('../middleware/validation');
const { ingestVitals } = require('../controllers/ingest');
const router = express.Router();


router.post('/v1/vitals', validateVitalsPayload, ingestVitals);

module.exports = router;