import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import fetchAPI from '../utils/Fetch';

export default function PatientDetail({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('heart_rate');



  useEffect(() => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    const fetchPatientData = async () => {
      try {
        const patientResponse = await fetchAPI({
          url: `/fhir/Patient/${patientId}`,
          method: 'GET',
        });
        setPatient(patientResponse.data);

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const observationsResponse = await fetchAPI({
          url: `/fhir/Observation?patient=${patientId}&date=ge${sevenDaysAgo}`,
          method: 'GET',
        });

        setObservations(observationsResponse.data?.entry || []);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleMarkReviewed = async (observationId) => {
    try {
      await fetchAPI({
        url: `/observations/${observationId}/reviewed`,
        method: 'PATCH',
      });
      setObservations(obs => obs.map(o => o.resource.id === observationId ? {...o,resource: { ...o.resource, reviewed: true }}: o));
    } catch (err) {
      console.error('Error marking observation as reviewed:', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary me-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-muted">Loading patient data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        <i className="bi bi-person-x me-2"></i>
        Patient not found
      </div>
    );
  }


const getChartData = () => {
  let filteredObs, label, color;
  
  if (chartType === 'heart_rate') {
    filteredObs = observations.filter(({ resource }) => resource.code?.text === 'heart_rate');
    label = 'Heart Rate (beats/min)';
    color = 'rgb(220, 53, 69)';
  } else if (chartType === 'bp_systolic') {
    filteredObs = observations.filter(({ resource }) => resource.code?.text === 'bp');
    label = 'Systolic BP (mm[Hg])';
    color = 'rgb(54, 162, 235)';
  } else if (chartType === 'bp_diastolic') {
    filteredObs = observations.filter(({ resource }) => resource.code?.text === 'bp');
    label = 'Diastolic BP (mm[Hg])';
    color = 'rgb(255, 206, 86)';
  }

  const sortedObs = filteredObs.sort((a, b) => 
    new Date(a.resource.effectiveDateTime) - new Date(b.resource.effectiveDateTime)
  );

  return {
    labels: sortedObs.map(({ resource }) =>
      new Date(resource.effectiveDateTime).toLocaleDateString()
    ),
    datasets: [
      {
        label,
        data: sortedObs.map(({ resource }) => {
          if (chartType === 'heart_rate') {
            return resource.valueQuantity?.value || 0;
          } else if (chartType === 'bp_systolic') {
            const systolicValue = resource.component?.find(comp => 
              comp.code?.text === 'systolic'
            )?.valueQuantity?.value;
            console.log('Systolic vlue:', systolicValue);
            return systolicValue || 0;
          } else if (chartType === 'bp_diastolic') {
            const diastolicValue = resource.component?.find(comp => comp.code?.text === 'diastolic')?.valueQuantity?.value;
            return diastolicValue || 0;
          }
        }),
        fill: false,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.1,
        borderWidth: 2,
        pointBackgroundColor: sortedObs.map(({ resource }) => resource.is_abnormal ? 'red' : color),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: sortedObs.map(({ resource }) => 
        resource.is_abnormal ? 6 : 4
      ),
      },
    ],
  };
  };
  
const chartData = getChartData();


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${chartData.datasets[0].label} Trend (Last 7 days)`},
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Heart Rate (bpm)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  const patientName = patient.name?.[0]?.text || (patient.name?.[0]?.given?.join(' ') + ' ' + patient.name?.[0]?.family).trim();

  return (
    <div className="h-100">
      <div className="bg-light p-4 border-bottom">
        <div className="d-flex align-items-center mb-3">
          <div 
            className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center me-3" 
            style={{ width: '50px', height: '50px', fontSize: '20px', fontWeight: 'bold' }}
          >
            {patientName?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div>
            <h3 className="mb-0">{patientName}</h3>
            <small className="text-muted">Patient ID: {patient.id}</small>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4">
            <small className="text-muted">Date of Birth</small>
            <div className="fw-semibold">
              {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Gender</small>
            <div className="fw-semibold">
              {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown'}
            </div>
          </div>
          <div className="col-md-4">
            <small className="text-muted">Age</small>
            <div className="fw-semibold">
              {patient.birthDate ? 
                Math.floor((new Date() - new Date(patient.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) + ' years' : 
                'N/A'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {observations.length > 0 && (
          <div className="mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Vital Signs Trend</h6>
                <select  className="form-select form-select-sm" style={{width: 'auto'}} value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <option value="heart_rate">Heart Rate</option>
                  <option value="bp_systolic">Blood Pressure (Systolic)</option>
                  <option value="bp_diastolic">Blood Pressure (Diastolic)</option>
                </select>
              </div>
              <div className="card-body">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-clipboard-data me-2"></i>
              Recent Observations (Last 7 days)
            </h5>
          </div>
          <div className="card-body p-0">
            {observations.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                      <th>Alert</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.map(({ resource }) => (
                      <tr key={resource.id}>
                      <td>
                        <span className="fw-medium">
                              {resource.code?.text || 'Unknown'}

                        </span>
                      </td>

                      <td className="fw-semibold">
                        {resource.code?.text === 'bp'  ? `${resource.component?.[0]?.valueQuantity?.value}/${resource.component?.[1]?.valueQuantity?.value}`: resource.valueQuantity?.value}
                      </td>
                        <td className="text-muted">
                          {resource.code?.text === 'bp' ? 'mm[Hg]' : resource.valueQuantity?.unit}
                      </td>

                        <td>
                          <small>
                            {new Date(resource.effectiveDateTime).toLocaleString()}
                          </small>
                        </td>
                        <td>
                          {resource.reviewed ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Reviewed
                            </span>
                          ) : (
                            <span className="badge bg-warning">
                              <i className="bi bi-clock me-1"></i>
                              Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {resource.is_abnormal ? (
                            <span className="badge bg-danger">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Abnormal
                            </span>
                          ) : (
                            <span className="badge bg-success">
                              <i className="bi bi-check me-1"></i>
                              Normal
                            </span>
                          )}
                        </td>
                        <td>
                          {!resource.reviewed && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleMarkReviewed(resource.id)}
                            >
                              <i className="bi bi-check me-1"></i>
                              Mark Reviewed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-5">
                <i className="bi bi-clipboard-x display-4 text-muted mb-3"></i>
                <h6 className="text-muted">No observations found</h6>
                <p className="text-muted mb-0">
                  No observations have been recorded for this patient in the last 7 days.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}