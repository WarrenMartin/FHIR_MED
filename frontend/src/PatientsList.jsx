import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import fetchAPI from './utils/Fetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSearch } from '@fortawesome/free-solid-svg-icons';
import PatientDetail from './components/PatientDetail';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

 

  const handleViewPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setShowOffcanvas(true);
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      width: '25%',
      cell: row => (
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center me-3" 
            style={{ width: '30px', height: '30px', fontSize: '16px', fontWeight: 'bold', opacity: 0.7 }}
          >
            {row.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div>
            <div className="fw-semibold text-dark">{row.name}</div>
            <small className="text-muted">ID: {row.id}</small>
          </div>
        </div>
      ),
    },
    {
      name: 'Date of Birth',
      selector: row => row.birthDate,
      sortable: true,
      width: '25%',
      cell: row => row.birthDate ? (
        <div>
          <div className="text-dark">{new Date(row.birthDate).toLocaleDateString()}</div>
          <small className="text-muted">
            Age: {Math.floor((new Date() - new Date(row.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))}
          </small>
        </div>
      ) : (
        <span className="text-muted">N/A</span>
      ),
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true,
      width: '25%',
      cell: row => (
        <span className={` ${
          row.gender === 'male' ? 'text-primary' : 
          row.gender === 'female' ? 'text-danger' : 
          ''
        }`}>
          {row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : 'Unknown'}
        </span>
      ),
    },
    {
      name: 'Actions',
      width: '120px',
      cell: row => (
        <button 
          className="btn btn-link text-danger p-0 d-flex align-items-center fs-6" 
          onClick={(e) => { 
            e.stopPropagation();  
            handleViewPatient(row.id);
          }} 
          style={{ fontWeight: '500', textDecoration: 'none' }}
        >
          <FontAwesomeIcon icon={faEye} className="me-1" size="sm" /> View
        </button>
      ),
    },
  ];

const fetchPatients = async (searchQuery = '') => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetchAPI({
      url: `/fhir/Patient?name=${encodeURIComponent(searchQuery)}`,
      method: 'GET',
    });

    const patientsData = response.data?.entry?.map(({ resource }) => ({
      id: resource.id,
      name: resource.name?.[0]?.text || 
            (resource.name?.[0]?.given?.join(' ') + ' ' + resource.name?.[0]?.family).trim(),
      birthDate: resource.birthDate,
      gender: resource.gender,
      telecom: resource.telecom,
    })) || [];

    setPatients(patientsData);
    setFilteredPatients(patientsData);
  } catch (err) {
    console.error(err);
    setError('Failed to fetch patients. Please try again.');
    setPatients([]);
    setFilteredPatients([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPatients(''); 
  }, []);

useEffect(() => {
  const delayedSearch = setTimeout(() => {
    fetchPatients(query);
  }, 300);

  return () => clearTimeout(delayedSearch);
}, [query]);


  const handleRowClick = (row) => {
    handleViewPatient(row.id);
  };

  const CustomNoDataComponent = () => (
    <div className="text-center p-5">
      <i className="bi bi-person-x display-1 text-muted mb-3"></i>
      <h5 className="text-muted">
        {query ? `No patients found for "${query}"` : 'No patients found'}
      </h5>
      <p className="text-muted">
        {query ? 'Try searching with a different name or clear the search to see all patients' :'No patients are currently available in the system'}
      </p>
      {query && (
        <button className="btn btn-outline-primary mt-2" onClick={() => setQuery('')}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Clear Search
        </button>
      )}
    </div>
  );

  const CustomProgressComponent = () => (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary me-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted">
        {query ? 'Searching patients...' : 'Loading patients...'}
      </span>
    </div>
  );

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="mb-0 text-danger" style={{ opacity: '0.8' }}>
                    <i className="bi bi-people-fill me-2"></i>
                    Patient Directory
                  </h2>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-danger text-white">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>

                    <input type="search" className="form-control form-control-lg" placeholder="Search patients by name..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ fontSize: '16px' }}/>
                    {query && (
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setQuery('')} title="Clear search">
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                  <small className="text-muted mt-1 d-block">
                    {hasSearched && !loading && (
                      <>Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}</>
                    )}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {error && (
                <div className="alert alert-danger m-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => fetchPatients(query)}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Retry
                  </button>
                </div>
              )}

              <DataTable
                title={
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span className="text-dark fw-bold">
                      {hasSearched && !loading ? (
                        <>
                          {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''}
                          {query && ` - Search Results`}
                        </>
                      ) : ( 'Patients')}
                    </span>
                    
                  </div>
                }
                columns={columns}
                data={filteredPatients}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                progressPending={loading}
                progressComponent={<CustomProgressComponent />}
                noDataComponent={<CustomNoDataComponent />}
                onRowClicked={handleRowClick}
                pointerOnHover
                highlightOnHover
                responsive
                fixedHeader
                fixedHeaderScrollHeight="600px"
                striped
                defaultSortFieldId="name"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`offcanvas offcanvas-end${showOffcanvas ? ' show' : ''}`} tabIndex="-1" id="patientDetailOffcanvas" style={{ visibility: showOffcanvas ? 'visible' : 'hidden',width: '60%',maxWidth: '800px'}}>
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title text-danger">
            <i className="bi bi-person-circle me-2"></i>Patient Details
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowOffcanvas(false)} aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-0">
          {selectedPatientId && (<PatientDetail patientId={selectedPatientId} />)}
        </div>
      </div>

      {showOffcanvas && (
        <div className="offcanvas-backdrop fade show" onClick={() => setShowOffcanvas(false)}></div>
      )}
    </div>
  );
}