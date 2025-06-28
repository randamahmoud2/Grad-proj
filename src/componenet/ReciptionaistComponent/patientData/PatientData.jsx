import { FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export const Showpatientdata = () => { 
    const navigate = useNavigate();  
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/patients', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    throw new Error(`Failed to load patients: ${response.statusText}`);
                }
                const data = await response.json();
                setPatients(data);
            } catch (err) {
                setError('Failed to load patients. Please try again later.');
                console.error('Error fetching patients:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Filter patients by name, ID, or national ID
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toString().includes(searchTerm) ||
        patient.nationalId.includes(searchTerm)
    );

    if (loading) return <div className="loading">Loading patients...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className='patientdata1'>
            <div className='header'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Patients</p>
                    </div>
                </div>
                <div className='search'>
                    <i><FaSearch /></i>
                    <input
                        type="text"
                        value={searchTerm}
                        aria-label="Search patients"
                        placeholder="Quick search patients..."
                        title="Search by name, ID, or national ID"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <hr id="split"/>

                <table className='table3'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>National ID</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    No patients found
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map(patient => (
                                <tr 
                                    className='patient-row' 
                                    key={patient.id} 
                                    onClick={() => navigate(`/Receptionist/Patient/${patient.id}`)}
                                >      
                                    <td>{patient.id}</td>
                                    <td>{patient.name}</td>                      
                                    <td>{patient.age}</td>
                                    <td>{patient.gender}</td>
                                    <td>{patient.nationalId}</td>
                                    <td>{patient.address}</td>
                                </tr> 
                            ))
                        )}
                    </tbody>
                </table>
            </div>
    );
};

export default Showpatientdata;