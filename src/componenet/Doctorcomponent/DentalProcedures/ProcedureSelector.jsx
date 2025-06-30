import React, { useState, useEffect } from 'react';
import './ProcedureSelector.css';

const API_BASE_URL = "http://localhost:5068/api";

const ProcedureSelector = ({ toothId, onProcedureSelect, onClose, existingProcedures = [] }) => {
  const [dentalProcedures, setDentalProcedures] = useState([]);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/DentalChart/procedures`);
        if (!response.ok) {
          throw new Error('Failed to fetch procedures');
        }
        const data = await response.json();
        setDentalProcedures(data);
      } catch (error) {
        console.error('Error fetching procedures:', error);
      }
    };

    fetchProcedures();
  }, []);

  return (
    <div className="procedure-selector-overlay">
      <div className="procedure-selector">
        <div className="procedure-selector-header">
          <h3>Select Procedure for Tooth #{toothId}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {existingProcedures.length > 0 && (
          <div className="existing-procedures">
            <h4>Existing Procedures for Tooth #{toothId}</h4>
            <ul>
              {existingProcedures.map(proc => (
                <li key={proc.id}>
                  <span>{proc.name}</span>
                  <span>{proc.cost} EGP</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="procedure-list">
          {dentalProcedures.length > 0 ? (
            dentalProcedures.map(procedure => (
              <div 
                key={procedure.id}
                className="procedure-option"
                onClick={() => onProcedureSelect(toothId, procedure)}
              >
                <div className="procedure-name-container">
                  <span className={`procedure-color-indicator ${procedure.type}`}></span>
                  <span className="procedure-name">{procedure.name}</span>
                </div>
                <span className="procedure-cost">{procedure.cost} EGP</span>
              </div>
            ))
          ) : (
            <div>No procedures available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcedureSelector;