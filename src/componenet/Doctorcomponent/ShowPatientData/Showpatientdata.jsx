import './Showpatientdata.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Showpatientdata = () => { 
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Get doctorId from auth data
                const doctorId = localStorage.getItem('doctorId');
                
                if (!doctorId) {
                    throw new Error('Doctor ID not found');
                }

                const response = await fetch(`http://localhost:5068/api/Bookings/doctor/${doctorId}/patients`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch patients');
                }

                const data = await response.json();
                setPatients(data);
            } catch (err) {
                setError(err.message);
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
        (patient.id && patient.id.toString().includes(searchTerm)) ||
        (patient.national_id && patient.national_id.includes(searchTerm))
    );

    if (loading) {
        return (
            <div className='patientdata1'>
                <div className='header'>
                    <div className='data2'>
                        <div className='title2'>
                            <p>Patients</p>
                        </div>
                    </div>
                    <div className='search'>
                        <input
                            type="text"
                            placeholder="Search"
                            disabled
                        />
                    </div>
                </div>
                <hr id="split"/>
                <p>Loading patients data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className='patientdata1'>
                <div className='header'>
                    <div className='data2'>
                        <div className='title2'>
                            <p>Patients</p>
                        </div>
                    </div>
                    <div className='search'>
                        <input
                            type="text"
                            placeholder="Search"
                            disabled
                        />
                    </div>
                </div>
                <hr id="split"/>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className='patientdata1'>
            <div className='header'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Patients</p>
                    </div>
                </div>
                <div className='search'>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <hr id="split"/>

            <table className='table3'>
                <thead>
                    <tr style={{background:"rgba(216, 211, 211, 0.851)"}}>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>National ID</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                            <tr 
                                className='special'  
                                key={patient.id} 
                                onClick={() => navigate(`/Doctor/Patient/${patient.id}/Prescription`)}
                            >      
                                <td>{patient.id}</td>
                                <td>{patient.name}</td>                      
                                <td>{patient.age}</td>
                                <td>{patient.gender}</td>
                                <td>{patient.national_id}</td>
                                <td>{patient.address}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>
                                {searchTerm ? 'No matching patients found' : 'No patients available'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Showpatientdata;