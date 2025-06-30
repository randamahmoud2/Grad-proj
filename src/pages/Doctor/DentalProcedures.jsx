import './DentalProcedures.css';
import { useParams } from 'react-router-dom';
import Patients from '../../PatientData.json';
import React, { useState, useEffect } from 'react';
import DentalChart from '../../componenet/Doctorcomponent/DentalProcedures/DentalChart';
import Patientoption from '../../componenet/Doctorcomponent/ShowPatientData/Patientoption';

const DentalProcedures = () => {
  const { id } = useParams();
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [patient, setPatient] = useState(null);
  
  useEffect(() => {
    // Find patient data
    const patientData = Patients.find((p) => String(p.id) === id);
    setPatient(patientData);
  }, [id]);
  
  return (
    <div className='dental-procedures-page'>
      <Patientoption/>
      <div className="dental-procedures-container">
        <div className="data2">
          <div className='title2'>
            <p>Dental Procedures</p>
            <p id="name">{patient ? `${patient.name} / ${patient.id}` : `Patient ID: ${id}`}</p>
          </div>
        </div>
        <hr id="split" />
        
        <div className="dental-procedures-content">
          <div className="dental-chart-container">
            <DentalChart 
              selectedTooth={selectedTooth} 
              setSelectedTooth={setSelectedTooth}
              selectedProcedure={selectedProcedure}
              patientId={id}
            />
          </div>
          
          <div className="procedure-selection">
            {selectedTooth && (
              <div className="tooth-info">
                <h3>Selected Tooth: {selectedTooth}</h3>
                <div className="procedure-options">
                  <h4>Select Procedure</h4>
                  <div className="procedure-list">
                    {/* Procedure selection will be handled by the ProcedureSelector component */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalProcedures; 