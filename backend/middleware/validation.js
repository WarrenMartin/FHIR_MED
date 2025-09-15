const moment = require('moment');

// Valid unit combinations for each type
const VALID_UNITS = {
  heart_rate: ['beats/min'],
  bp: ['mm[Hg]'],
  temp: ['Cel', 'degC'],
  spo2: ['%'],
};

function validateVitalsPayload(req, res, next) {
  const { device, patient, reading, idempotency_key } = req.body;

  // Check required fields
  if (!device || !patient || !reading || !idempotency_key) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate device
  if (!device.id || !device.vendor) {
    return res.status(400).json({ error: 'Invalid device data' });
  }

  // Validate patient
  if (!patient.national_id || !patient.name || !patient.dob || !patient.sex) {
    return res.status(400).json({ error: 'Invalid patient data' });
  }

  if (!['male', 'female', 'other'].includes(patient.sex)) {
    return res.status(400).json({ error: 'Invalid sex value' });
  }

  // Validate reading
  const { type, unit, at } = reading;
  
  if (!type || !unit || !at) {
    return res.status(400).json({ error: 'Invalid reading data' });
  }

  // Check valid type
  if (!['heart_rate', 'bp', 'temp', 'spo2'].includes(type)) {
    return res.status(400).json({ error: 'Invalid reading type' });
  }

  // Check valid unit for type
  if (!VALID_UNITS[type].includes(unit)) {
    return res.status(400).json({ error: `Invalid unit ${unit} for type ${type}` });
  }

  // Validate timestamp
  const timestamp = moment(at);
  if (!timestamp.isValid()) {
    return res.status(400).json({ error: 'Invalid timestamp' });
  }

  // Check if timestamp is not more than 5 minutes in the future
  const now = moment();
  const maxFuture = now.clone().add(5, 'minutes');
  if (timestamp.isAfter(maxFuture)) {
    return res.status(400).json({ error: 'Timestamp cannot be more than 5 minutes in the future' });
  }

  // Validate value based on type
  if (type === 'bp') {
    if (typeof reading.systolic !== 'number' || typeof reading.diastolic !== 'number') {
      return res.status(400).json({ error: 'Blood pressure requires systolic and diastolic values' });
    }
  } else {
    if (typeof reading.value !== 'number') {
      return res.status(400).json({ error: `${type} requires a numeric value` });
    }
  }

  next();
}

module.exports = { validateVitalsPayload };