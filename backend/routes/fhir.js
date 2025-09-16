const express = require('express');
// const { Patient, Observation } = require('../models');
const { searchPatients,getSpecificPatient,searchObservations}= require('../controllers/fhir');

const router = express.Router();

router.get('/Patient', searchPatients);

router.get('/Patient/:id', getSpecificPatient);

router.get('/Observation', searchObservations);

module.exports = router;