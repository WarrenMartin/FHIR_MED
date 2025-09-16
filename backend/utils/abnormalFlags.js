function checkAbnormalFlags(observation) {
  const { type, value, systolic, diastolic } = observation;
  
  switch (type) {
    case 'heart_rate':
      return value > 120; 
      
    case 'bp':
      return systolic >= 140 || diastolic >= 90; 
      
    case 'spo2':
      return value < 92; 
      
    case 'temp':
      return value >= 38; 
      
    default:
      return false;
  }
}

module.exports = { checkAbnormalFlags };