const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const { Patient, Observation } = require('./models');

const ingestRoutes = require('./routes/ingest');
const fhirRoutes = require('./routes/fhir');
const observationsRoutes = require('./routes/observations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

app.use('/ingest', ingestRoutes);
app.use('/fhir', fhirRoutes);
app.use('/observations', observationsRoutes);


async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database models synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();