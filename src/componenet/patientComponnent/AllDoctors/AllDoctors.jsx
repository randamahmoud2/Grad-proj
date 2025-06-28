import './AllDoctors.css';
import user from "../../../image/doc2.png"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AllDoctors = () => {
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
        <div className='AllDoctors'>
            <div className='data2'>
                <div className='title2'>
                    <p>Doctors</p>
                </div>
            </div>
            <hr id="split" />
            <div className='doctoroptions'>
                <div className='doctor'>
                    {error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : (
                        doctors.slice(0, 4).map((item, index) => (
                            <div
                                className='avability'
                                key={index}
                                onClick={() => navigate(`/Patient/appointment/${item.id}`)}
                            >
                                <img src={item.imageUrl || user} alt={item.name} />
                                <div className='appointment-Info'>
                                    <div>
                                        <p className='dot'></p>
                                        <p
                                            style={{
                                                color: item.isActive
                                                    ? 'rgba(0, 128, 0, 0.852)'
                                                    : 'rgba(255, 0, 0, 0.852)',
                                                fontSize: '12px',
                                            }}
                                            className='avalible'
                                        >
                                            {item.isActive ? 'Available' : 'Not Available'}
                                      {console.log(item)}
                                        </p>
                                    </div>
                                    <p style={{ textTransform: 'capitalize' }}>Dr.{item.name}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllDoctors;