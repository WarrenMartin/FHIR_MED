const { Patient, Observation } = require('../models');
const { checkAbnormalFlags } = require('../utils/abnormalFlags');
const moment = require('moment');


function normalizeTemperatureUnit(unit) {
  return unit === 'degC' ? 'Cel' : unit;
}


const ingestVitals = async (req, res) => {
    try {
        const { patient, reading, idempotency_key } = req.body;

        const existingObservation = await Observation.findOne({where: { idempotency_key }});

        if (existingObservation) {
            return res.status(200).json({message: 'Observation already exists',observation_id: existingObservation.id});
        }

        // Find or create patient
        let patientRecord = await Patient.findOne({where: { national_id: patient.national_id }});

        if (!patientRecord) {
            patientRecord = await Patient.create({
                national_id: patient.national_id,
                name: patient.name,
                dob: patient.dob,
                sex: patient.sex
            });
        }

        let normalizedUnit = reading.unit;
        if (reading.type === 'temp') {
            normalizedUnit = normalizeTemperatureUnit(reading.unit);
        }

        // Prepare obv data
        const observationData = {
            patient_id: patientRecord.id,
            type: reading.type,
            unit: normalizedUnit,
            timestamp: moment(reading.at).toDate(),
            idempotency_key,
            reviewed: false
        };

        if (reading.type === 'bp') {
            observationData.systolic = reading.systolic;
            observationData.diastolic = reading.diastolic;
        } else {
            observationData.value = reading.value;
        }

        observationData.is_abnormal = checkAbnormalFlags(observationData);

        const observation = await Observation.create(observationData);

        res.status(201).json({ message: 'Vitals ingested successfully', patient_id: patientRecord.id, observation_id: observation.id, is_abnormal: observation.is_abnormal});

    } catch (error) {
        console.error('Error ingesting vitals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    ingestVitals
};