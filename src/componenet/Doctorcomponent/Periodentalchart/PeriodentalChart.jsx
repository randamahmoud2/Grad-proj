// import React, { useEffect, useState } from 'react';
// import './perio.css';
// import Layout from "../../../Layout";
// import { useParams, useNavigate } from 'react-router-dom';

// const PeriodentalChart = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [patient, setPatient] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchPatient = async () => {
//       try {
//         const response = await fetch(`http://localhost:5068/api/Patients/${id}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch patient');
//         }
//         const data = await response.json();
//         setPatient(data);
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchPatient();
//   }, [id]);

//   return (
//     <div className='perio'>
//       <div className="data2">
//         <div className='title2'>
//           <p>Periodontal Chart</p>
//           {error ? (
//             <span style={{ color: "red" }}>Error: {error}</span>
//           ) : patient ? (
//             <p id="name">{patient.name} / {patient.id}</p>
//           ) : (
//             <span>Loading...</span>
//           )}
//         </div>
//       </div>
//       <hr id="split" />
//       <Layout />
//     </div>
//   );
// };

// export default PeriodentalChart;

import React, { useEffect, useState } from 'react';
import './perio.css';
import Layout from "../../../Layout";
import { useParams, useNavigate } from 'react-router-dom';
import patientChartManager from '../../../utils/patientChartManager';

const PeriodentalChart = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const initializeChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch patient data
        const patientResponse = await fetch(`http://localhost:5068/api/Patients/${id}`);
        if (!patientResponse.ok) {
          throw new Error('Failed to fetch patient');
        }
        const patientData = await patientResponse.json();
        setPatient(patientData);

        // Initialize chart manager for this patient
        const chartData = await patientChartManager.initializeForPatient(id);
        setChartData(chartData);

        console.log(`PerioChart initialized for patient ${id}`);
      } catch (err) {
        console.error('Error initializing PerioChart:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      initializeChart();
    }

    // Cleanup when component unmounts or patient changes
    return () => {
      patientChartManager.cleanup();
    };
  }, [id]);

  const handleResetChart = async () => {
    try {
      await patientChartManager.resetChartData();
      const newChartData = patientChartManager.getCurrentChartData();
      setChartData(newChartData);
      console.log('Chart reset successfully');
    } catch (error) {
      console.error('Error resetting chart:', error);
      setError('Failed to reset chart');
    }
  };

  const handleToggleAutoSave = () => {
    const currentState = patientChartManager.autoSaveEnabled;
    patientChartManager.setAutoSaveEnabled(!currentState);
    console.log(`Auto-save ${!currentState ? 'enabled' : 'disabled'}`);
  };

  if (isLoading) {
    return (
      <div className='perio'>
        <div className="data2">
          <div className='title2'>
            <p>Periodontal Chart</p>
            <span>Loading...</span>
          </div>
        </div>
        <hr id="split" />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Initializing chart for patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='perio'>
      <div className="data2">
        <div className='title2'>
          <p>Periodontal Chart</p>
          {error ? (
            <span style={{ color: "red" }}>Error: {error}</span>
          ) : patient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <p id="name">{patient.name} / {patient.id}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleResetChart}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Reset Chart
                </button>
                <button 
                  onClick={handleToggleAutoSave}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: patientChartManager.autoSaveEnabled ? '#51cf66' : '#868e96',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Auto-save: {patientChartManager.autoSaveEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          ) : (
            <span>Loading...</span>
          )}
        </div>
      </div>
      <hr id="split" />
      <Layout />
    </div>
  );
};

export default PeriodentalChart;
