const express = require('express');
// const { Patient, Observation } = require('../models');
const { searchPatients,getSpecificPatient,searchObservations}= require('../controllers/fhir');

const router = express.Router();

// GET /fhir/Patient - Search patients
router.get('/Patient', searchPatients);

// GET /fhir/Patient/:id - Get specific patient
router.get('/Patient/:id', getSpecificPatient);

// GET /fhir/Observation - Search observations
router.get('/Observation', searchObservations);

module.exports = router;