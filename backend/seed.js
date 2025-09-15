const { Patient, Observation } = require('./models');
const sequelize = require('./config/database');
const moment = require('moment');

const seedData = async () => {
  try {
    // Clear existing data
    await Observation.destroy({ where: {} });
    await Patient.destroy({ where: {} });
    
    console.log('Cleared existing data');

    // Create patients
    const patients = await Patient.bulkCreate([
      {
        national_id: 'IN-1987-0001',
        name: 'Asha Kumar',
        dob: '1987-05-13',
        sex: 'female'
      },
      {
        national_id: 'IN-1992-0002',
        name: 'Raj Patel',
        dob: '1992-08-22',
        sex: 'male'
      },
      {
        national_id: 'IN-1985-0003',
        name: 'Priya Singh',
        dob: '1985-12-05',
        sex: 'female'
      }
    ]);

    console.log('Created patients');

    // Create observations for the last 7 days
    const observations = [];
    const baseDate = moment().subtract(7, 'days');
    let idCounter = 1; // Simple counter to ensure unique keys

    patients.forEach((patient, patientIndex) => {
      // Generate observations for each patient
      for (let day = 0; day < 7; day++) {
        const currentDate = baseDate.clone().add(day, 'days');
        
        // Heart rate observations (2-3 per day)
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          const timestamp = currentDate.clone().add(Math.floor(Math.random() * 24), 'hours');
          const heartRate = 60 + Math.floor(Math.random() * 80); // 60-140 bpm
          
          observations.push({
            patient_id: patient.id,
            type: 'heart_rate',
            value: heartRate,
            unit: 'beats/min',
            timestamp: timestamp.toDate(),
            reviewed: Math.random() > 0.7, // 30% reviewed
            is_abnormal: heartRate > 120,
            idempotency_key: `seed-hr-${patient.id}-${idCounter++}`
          });
        }

        // Blood pressure observations (1-2 per day)
        for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
          const timestamp = currentDate.clone().add(Math.floor(Math.random() * 24), 'hours');
          const systolic = 100 + Math.floor(Math.random() * 60); // 100-160
          const diastolic = 60 + Math.floor(Math.random() * 40); // 60-100
          
          observations.push({
            patient_id: patient.id,
            type: 'bp',
            systolic: systolic,
            diastolic: diastolic,
            unit: 'mm[Hg]',
            timestamp: timestamp.toDate(),
            reviewed: Math.random() > 0.6, // 40% reviewed
            is_abnormal: systolic >= 140 || diastolic >= 90,
            idempotency_key: `seed-bp-${patient.id}-${idCounter++}`
          });
        }

        // Temperature observations (1 per day)
        const tempTimestamp = currentDate.clone().add(Math.floor(Math.random() * 24), 'hours');
        const temperature = 36 + Math.random() * 4; // 36-40°C
        
        observations.push({
          patient_id: patient.id,
          type: 'temp',
          value: Math.round(temperature * 10) / 10,
          unit: 'Cel',
          timestamp: tempTimestamp.toDate(),
          reviewed: Math.random() > 0.5, // 50% reviewed
          is_abnormal: temperature >= 38,
          idempotency_key: `seed-temp-${patient.id}-${idCounter++}`
        });

        // SpO2 observations (1-2 per day)
        for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
          const timestamp = currentDate.clone().add(Math.floor(Math.random() * 24), 'hours');
          const spo2 = 88 + Math.floor(Math.random() * 12); // 88-100%
          
          observations.push({
            patient_id: patient.id,
            type: 'spo2',
            value: spo2,
            unit: '%',
            timestamp: timestamp.toDate(),
            reviewed: Math.random() > 0.6, // 40% reviewed
            is_abnormal: spo2 < 92,
            idempotency_key: `seed-spo2-${patient.id}-${idCounter++}`
          });
        }
      }
    });

    // Insert observations one by one to handle any conflicts
    for (const obs of observations) {
      try {
        await Observation.create(obs);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`Skipping duplicate observation: ${obs.idempotency_key}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log(`Created ${observations.length} observations`);
    console.log('Seed data created successfully');
    
    // Show summary
    const patientCount = await Patient.count();
    const observationCount = await Observation.count();
    const abnormalCount = await Observation.count({ where: { is_abnormal: true } });
    const reviewedCount = await Observation.count({ where: { reviewed: true } });
    
    console.log('\nSummary:');
    console.log(`- Patients: ${patientCount}`);
    console.log(`- Observations: ${observationCount}`);
    console.log(`- Abnormal: ${abnormalCount}`);
    console.log(`- Reviewed: ${reviewedCount}`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;