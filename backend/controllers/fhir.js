const moment = require('moment');
const { Patient, Observation } = require('../models');
const { Op } = require('sequelize');


const searchPatients = async (req, res) => {
    try {
        const { name, identifier } = req.query;
        const where = {};

        if (name) {
            where.name = { [Op.iLike]: `%${name}%` };
        }

        if (identifier) {
            where.national_id = identifier;
        }

        const patients = await Patient.findAll({ where });

        const fhirPatients = patients.map(patient => ({
            resourceType: 'Patient',
            id: patient.id.toString(),
            identifier: [{
                value: patient.national_id
            }],
            name: [{ text: patient.name}],
            birthDate: patient.dob,
            gender: patient.sex
        }));

        res.json({ resourceType: 'Bundle', total: fhirPatients.length, entry: fhirPatients.map(patient => ({ resource: patient })) });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSpecificPatient=async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Convert to FHIR-like format
    const fhirPatient = {
      resourceType: 'Patient',
      id: patient.id.toString(),
      identifier: [{
        value: patient.national_id
      }],
      name: [{
        text: patient.name
      }],
      birthDate: patient.dob,
      gender: patient.sex
    };

    res.json(fhirPatient);

  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const searchObservations = async (req, res) => {
  try {
    const { patient, code, date } = req.query;
    const where = {};

    if (patient) {
      where.patient_id = patient;
    }

    if (code) {
      where.type = code;
    }

    if (date) {
      const startDate = moment(date).startOf('day').toDate();
      const endDate = moment(date).endOf('day').toDate();
      where.timestamp = {
        [Op.between]: [startDate, endDate]
      };
    }

    const observations = await Observation.findAll({
      where,
      include: [{
        model: Patient,
        attributes: ['name', 'national_id']
      }],
      order: [['timestamp', 'DESC']]
    });

    // Convert to FHIR-like format
    const fhirObservations = observations.map(obs => {
      const observation = {
        resourceType: 'Observation',
        id: obs.id.toString(),
        status: 'final',
        code: {
          text: obs.type
        },
        subject: {
          reference: `Patient/${obs.patient_id}`
        },
        effectiveDateTime: obs.timestamp,
        component: []
      };

      if (obs.type === 'bp') {
        observation.component = [
          {
            code: { text: 'systolic' },
            valueQuantity: {
              value: obs.systolic,
              unit: obs.unit
            }
          },
          {
            code: { text: 'diastolic' },
            valueQuantity: {
              value: obs.diastolic,
              unit: obs.unit
            }
          }
        ];
      } else {
        observation.valueQuantity = {
          value: obs.value,
          unit: obs.unit
        };
      }

      return observation;
    });

    res.json({
      resourceType: 'Bundle',
      total: fhirObservations.length,
      entry: fhirObservations.map(obs => ({ resource: obs }))
    });

  } catch (error) {
    console.error('Error searching observations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  searchPatients,getSpecificPatient,searchObservations
};