const Patient = require('./patient');
const Observation = require('./observation');

Patient.hasMany(Observation, { foreignKey: 'patient_id' });
Observation.belongsTo(Patient, { foreignKey: 'patient_id' });

module.exports = {
  Patient,Observation,
};