import React, { useEffect, useState } from 'react';
import './perio.css';
import Layout from "../../../Layout";
import { useParams, useNavigate } from 'react-router-dom';

const PeriodentalChart = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`http://localhost:5068/api/Patients/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient');
        }
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPatient();
  }, [id]);

  return (
    <div className='perio'>
      <div className="data2">
        <div className='title2'>
          <p>Periodontal Chart</p>
          {error ? (
            <span style={{ color: "red" }}>Error: {error}</span>
          ) : patient ? (
            <p id="name">{patient.name} / {patient.id}</p>
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
