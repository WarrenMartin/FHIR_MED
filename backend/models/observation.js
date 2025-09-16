const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Observation = sequelize.define('Observation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'patients', key: 'id'},
  },
  type: {
    type: DataTypes.ENUM('heart_rate', 'bp', 'temp', 'spo2'),
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: true, 
  },
  systolic: {
    type: DataTypes.FLOAT,
    allowNull: true, 
  },
  diastolic: {
    type: DataTypes.FLOAT,
    allowNull: true, 
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_abnormal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  idempotency_key: { 
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'observations',
  timestamps: true,
});

module.exports = Observation;