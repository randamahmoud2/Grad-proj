import './DentalChart.css';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import ProcedureSelector from './ProcedureSelector';

const API_BASE_URL = "http://localhost:5068/api";

const DentalChart = ({ selectedTooth, setSelectedTooth, selectedProcedure, patientId }) => {
  const [procedures, setProcedures] = useState({});
  const [showProcedureSelector, setShowProcedureSelector] = useState(false);
  const [hoveredTooth, setHoveredTooth] = useState(null);
  
  // Upper teeth (maxillary)
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  
  // Lower teeth (mandibular)
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  useEffect(() => {
    const fetchPatientProcedures = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/DentalChart/patient/${patientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient procedures');
        }
        const data = await response.json();
        // Transform data to match frontend structure
        const transformedProcedures = data.reduce((acc, proc) => {
          if (!acc[proc.toothNumber]) {
            acc[proc.toothNumber] = {
              procedures: [],
              primaryType: proc.type
            };
          }
          acc[proc.toothNumber].procedures.push({
            id: proc.id,
            type: proc.type,
            name: proc.name,
            cost: proc.cost,
            date: proc.date,
            status: proc.status
          });
          return acc;
        }, {});
        setProcedures(transformedProcedures);
      } catch (error) {
        console.error('Error fetching patient procedures:', error);
      }
    };

    if (patientId) {
      fetchPatientProcedures();
    }
  }, [patientId]);
  
  // Handle tooth click
  const handleToothClick = (toothId) => {
    setSelectedTooth(toothId);
    setShowProcedureSelector(true);
  };
  
  // Add procedure to tooth
  const addProcedure = async (toothId, procedure) => {
    try {
      const response = await fetch(`${API_BASE_URL}/DentalChart/patient/${patientId}/procedure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toothNumber: toothId,
          procedureId: procedure.id,
          cost: parseFloat(procedure.cost),
          status: 'Done'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to add procedure');
      }
      const newProcedure = await response.json();
      setProcedures(prev => {
        if (prev[toothId] && prev[toothId].procedures) {
          return {
            ...prev,
            [toothId]: {
              ...prev[toothId],
              procedures: [
                ...prev[toothId].procedures,
                {
                  id: newProcedure.id,
                  type: newProcedure.type,
                  name: newProcedure.name,
                  cost: newProcedure.cost,
                  date: newProcedure.date,
                  status: newProcedure.status
                }
              ],
              primaryType: prev[toothId].procedures.length === 0 ? newProcedure.type : prev[toothId].primaryType
            }
          };
        }
        return {
          ...prev,
          [toothId]: {
            procedures: [
              {
                id: newProcedure.id,
                type: newProcedure.type,
                name: newProcedure.name,
                cost: newProcedure.cost,
                date: newProcedure.date,
                status: newProcedure.status
              }
            ],
            primaryType: newProcedure.type
          }
        };
      });
      setShowProcedureSelector(false);
    } catch (error) {
      console.error('Error adding procedure:', error);
    }
  };
  
  // Delete a specific procedure from a tooth
  const deleteProcedure = async (toothId, procedureId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/DentalChart/patient/procedure/${procedureId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete procedure');
      }
      setProcedures(prev => {
        if (!prev[toothId] || !prev[toothId].procedures) return prev;
        
        const updatedProcedures = prev[toothId].procedures.filter(p => p.id !== procedureId);
        
        if (updatedProcedures.length === 0) {
          const newProcedures = { ...prev };
          delete newProcedures[toothId];
          return newProcedures;
        }
        
        const primaryType = updatedProcedures[0].type;
        
        return {
          ...prev,
          [toothId]: {
            ...prev[toothId],
            procedures: updatedProcedures,
            primaryType
          }
        };
      });
    } catch (error) {
      console.error('Error deleting procedure:', error);
    }
  };
  
  // Get tooth status class based on procedures
  const getToothClass = (toothId) => {
    if (!procedures[toothId] || !procedures[toothId].primaryType) return '';
    
    switch(procedures[toothId].primaryType) {
      case 'crown':
        return 'crown-tooth';
      case 'filling':
        return 'filling-tooth';
      case 'extraction':
        return 'extraction-tooth';
      case 'implant':
        return 'implant-tooth';
      case 'root-canal':
        return 'root-canal-tooth';
      case 'cleaning':
        return 'cleaning-tooth';
      default:
        return '';
    }
  };
  
  // Get tooth image based on procedure
  const getTeethImage = (toothId, isUpperTeeth) => {
    const defaultImage = isUpperTeeth 
      ? `/assets/teeth/${toothId}.png` 
      : `/assets/teeth/${toothId}.png`;
    
    if (!procedures[toothId] || !procedures[toothId].primaryType) {
      return defaultImage;
    }
    
    switch(procedures[toothId].primaryType) {
      case 'implant':
        return isUpperTeeth
          ? `/assets/implants/${toothId}.png`
          : `/assets/implants/${toothId}.png`;
      case 'crown':
        return defaultImage;
      case 'extraction':
        return '/assets/extraction/empty.png';
      default:
        return defaultImage;
    }
  };
  
  // Calculate total cost for all procedures
  const calculateTotalCost = () => {
    return Object.values(procedures).reduce((total, tooth) => {
      const toothTotal = tooth.procedures.reduce((sum, procedure) => {
        return sum + parseFloat(procedure.cost || 0);
      }, 0);
      return total + toothTotal;
    }, 0).toFixed(2);
  };
  
  // Calculate total cost for a specific tooth
  const calculateToothTotal = (toothId) => {
    if (!procedures[toothId] || !procedures[toothId].procedures) return 0;
    
    return procedures[toothId].procedures.reduce((sum, procedure) => {
      return sum + parseFloat(procedure.cost || 0);
    }, 0).toFixed(2);
  };
  
  return (
    <div className="dental-chart">
      <div className="chart-title">
        <h3>Dental Chart</h3>
        <p>Click on a tooth to select treatment</p>
      </div>
      
      <div className="teeth-container">
        {/* Upper teeth row */}
        <div className="teeth-row upper-teeth">
          {upperTeeth.map(toothId => (
            <motion.div 
              key={`tooth-${toothId}`}
              className={`tooth ${getToothClass(toothId)} ${selectedTooth === toothId ? 'selected' : ''} ${hoveredTooth === toothId ? 'hovered' : ''}`}
              onClick={() => handleToothClick(toothId)}
              onMouseEnter={() => setHoveredTooth(toothId)}
              onMouseLeave={() => setHoveredTooth(null)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              animate={selectedTooth === toothId ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
            >
              <div className="tooth-image-container">
                <img 
                  src={getTeethImage(toothId, true)} 
                  alt={`Tooth ${toothId}`} 
                  className="tooth-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/assets/teeth/${toothId}.png`;
                  }}
                />
              </div>
              <div className="tooth-number">{toothId}</div>
              {procedures[toothId] && procedures[toothId].procedures && procedures[toothId].procedures.length > 0 && (
                <motion.div 
                  className="procedure-indicator"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {procedures[toothId].procedures.length > 1 
                    ? `${procedures[toothId].procedures.length} procedures` 
                    : procedures[toothId].procedures[0].name.substring(0, 10)}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Lower teeth row */}
        <div className="teeth-row lower-teeth">
          {lowerTeeth.map(toothId => (
            <motion.div 
              key={`tooth-${toothId}`}
              className={`tooth ${getToothClass(toothId)} ${selectedTooth === toothId ? 'selected' : ''} ${hoveredTooth === toothId ? 'hovered' : ''}`}
              onClick={() => handleToothClick(toothId)}
              onMouseEnter={() => setHoveredTooth(toothId)}
              onMouseLeave={() => setHoveredTooth(null)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              animate={selectedTooth === toothId ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
            >
              <div className="tooth-image-container">
                <img 
                  src={getTeethImage(toothId, false)} 
                  alt={`Tooth ${toothId}`} 
                  className="tooth-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/assets/teeth/${toothId}.png`;
                  }}
                />
              </div>
              <div className="tooth-number">{toothId}</div>
              {procedures[toothId] && procedures[toothId].procedures && procedures[toothId].procedures.length > 0 && (
                <motion.div 
                  className="procedure-indicator"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {procedures[toothId].procedures.length > 1 
                    ? `${procedures[toothId].procedures.length} procedures` 
                    : procedures[toothId].procedures[0].name.substring(0, 10)}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {showProcedureSelector && selectedTooth && (
        <ProcedureSelector 
          toothId={selectedTooth} 
          onProcedureSelect={addProcedure}
          onClose={() => setShowProcedureSelector(false)}
          existingProcedures={procedures[selectedTooth]?.procedures || []}
        />
      )}
      
      {/* Procedures summary table */}
      <div className="procedures-summary">
        <h3>Procedures Summary</h3>
        <table className="procedures-table">
          <thead>
            <tr>
              <th>Tooth #</th>
              <th>Procedure</th>
              <th>Date</th>
              <th>Cost (EGP)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(procedures).length > 0 ? (
              Object.keys(procedures).map(toothId => (
                procedures[toothId].procedures.map(procedure => (
                  <tr key={`procedure-${procedure.id}`}>
                    <td>{toothId}</td>
                    <td>{procedure.name}</td>
                    <td>{procedure.date}</td>
                    <td>{procedure.cost}</td>
                    <td>{procedure.status}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteProcedure(toothId, procedure.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-procedures">No procedures added yet</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="total-label">Total</td>
              <td className="total-amount">
                {calculateTotalCost()}
              </td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Selected tooth details */}
      {selectedTooth && procedures[selectedTooth] && (
        <motion.div 
          className="selected-tooth-details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Tooth #{selectedTooth} Details</h3>
          <div className="tooth-procedures-list">
            <h4>Procedures</h4>
            <ul>
              {procedures[selectedTooth].procedures.map(procedure => (
                <motion.li 
                  key={procedure.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="procedure-name">{procedure.name}</span>
                  <span className="procedure-cost">{procedure.cost} EGP</span>
                </motion.li>
              ))}
            </ul>
            <div className="tooth-total">
              <span>Total for Tooth #{selectedTooth}:</span>
              <span>{calculateToothTotal(selectedTooth)} EGP</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DentalChart;