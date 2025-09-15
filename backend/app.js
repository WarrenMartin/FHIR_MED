const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const { Patient, Observation } = require('./models');

// Import routes
const ingestRoutes = require('./routes/ingest');
const fhirRoutes = require('./routes/fhir');
const observationsRoutes = require('./routes/observations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/ingest', ingestRoutes);
app.use('/fhir', fhirRoutes);
app.use('/observations', observationsRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models
      // await sequelize.sync({ force: true });
    await sequelize.sync({ alter: true });
    console.log('Database models synced successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();