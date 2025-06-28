import React, { useState, useEffect } from 'react';
import './DoctorList.css';
import { useNavigate } from 'react-router-dom';

const DoctorList = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Doctors', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch doctors');
                }

                const data = await response.json();
                setDoctors(data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                setError('Could not load doctors. Please try again later.');
            }
        };
        fetchDoctors();
    }, []);


    return (
        <div className='doctorList'>
            <div className='data2'>
                <div className='title2'>
                    <p>Doctors List</p>
                </div>
            </div>
            <hr id="split" />

            <table className='table3'>
                <thead>
                    <tr style={{ background: "rgba(216, 211, 211, 0.851)" }}>
                        <th>Name</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {error ? (
                        <tr><td colSpan="2" style={{ color: 'red', padding: '10px' }}>{error}</td></tr>
                    ) : (
                        doctors.map((doctor) => (
                            <tr className='special'  key={doctor.id} onClick={()=> navigate(`/Patient/Doctors/${doctor.id}`)}>   
                                <td style={{ width: "30%" }}>{doctor.name || 'Not specified'}</td>
                                <td>{doctor.location || 'Not specified'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DoctorList;