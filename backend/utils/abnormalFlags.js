function checkAbnormalFlags(observation) {
  const { type, value, systolic, diastolic } = observation;
  
  switch (type) {
    case 'heart_rate':
      return value > 120; // Tachycardia
      
    case 'bp':
      return systolic >= 140 || diastolic >= 90; // Hypertension
      
    case 'spo2':
      return value < 92; // Hypoxia
      
    case 'temp':
      return value >= 38; // Fever (assuming Celsius)
      
    default:
      return false;
  }
}

module.exports = { checkAbnormalFlags };