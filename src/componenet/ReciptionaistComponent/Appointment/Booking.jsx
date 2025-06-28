import user from "../../../image/doc2.png"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../patientComponnent/AllDoctors/AllDoctors.css';
import { Patientoption } from '../patientData/patientoption';

export const Booking = () => {
    const navigate = useNavigate();  
    const { id } = useParams();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Doctors');
                if (!response.ok) {
                    throw new Error('Failed to fetch doctors data');
                }
                const data = await response.json();
                setDoctors(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    if (loading) return <div>Loading doctors...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='AllDoctors'>
            <Patientoption/>
            <div className='data2'>
                <div className='title2'>
                    <p>Doctors</p>
                </div>
            </div>
            <hr id="split"/>
            <div className='doctoroptions'>
                <div className='doctor'>
                    {doctors.slice(0,4).map((doc, index) => (
                        <div 
                            className='avability' 
                            key={index} 
                            onClick={() => navigate(`/Reciptionaist/Patient/${id}/Book/${doc.id}`)}
                        >
                            <img src={doc.image || user}/>
                            <div className='appointment-Info'>
                                <div>
                                    <p className='dot'></p>
                                    <p 
                                        style={{
                                            color: "rgba(0, 128, 0, 0.852)", 
                                            fontSize: "12px"
                                        }} 
                                        className='avalible'
                                    >
                                        {doc.isActive ? "Available" : "Not Available"}
                                    </p>
                                </div>
                                <p style={{textTransform: "capitalize"}}>{doc.user?.name || doc.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Booking;




// import React from 'react'
// import all_product from '../../Assets/all_product'
// import patients from '../../../PatientData.json'
// import { useNavigate, useParams } from 'react-router-dom'
// import '../../patientComponnent/AllDoctors/AllDoctors.css'
// import { Patientoption } from '../patientData/patientoption'

// export const Booking = () => {
//     const navigate = useNavigate();  
//     const { id } = useParams();
    
//     return (
//         <div className='AllDoctors'>
//             <Patientoption/>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Doctors</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div className='doctoroptions'>
//                 <div className='doctor'>
//                     {all_product.slice(0,4).map((doc, index)=> (
//                         <div className='avability' key={index} onClick={() => navigate(`/Reciptionaist/Patient/${id}/Book/${doc.id}`)}>
//                             <img src={doc.image} alt="" />
//                             <div className='appointment-Info'>
//                                 <div>
//                                     <p className='dot'></p>
//                                     <p style={{"color":"rgba(0, 128, 0, 0.852)", "fontSize":"12px"}} className='avalible'>
//                                     Avalible</p>
//                                 </div>
//                                 <p style={{"textTransform":"capitalize"}}>{doc.name}</p>
//                             </div>
//                         </div>
//                     ))}

//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Booking;


// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Patientoption } from '../patientData/patientoption';
// import './Booking.css';

// export const Booking = () => {
//     const navigate = useNavigate();
//     const { id: patientId } = useParams();
//     const [patient, setPatient] = useState(null);
//     const [doctors, setDoctors] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [availableSlots, setAvailableSlots] = useState({});

//     const BASE_URL = 'http://localhost:5068';

//     // Wrap fetchData in useCallback to prevent recreation on every render
//     const fetchData = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const [patientRes, doctorsRes] = await Promise.all([
//                 fetch(`${BASE_URL}/api/Patients/${patientId}`),
//                 fetch(`${BASE_URL}/api/Doctors`)
//             ]);

//             if (!patientRes.ok || !doctorsRes.ok) {
//                 throw new Error('Failed to fetch data');
//             }

//             const [patientData, doctorsData] = await Promise.all([
//                 patientRes.json(),
//                 doctorsRes.json()
//             ]);

//             setPatient(patientData);
//             setDoctors(doctorsData);

//             // Fetch available slots
//             const slotsData = await Promise.all(
//                 doctorsData.map(doctor => 
//                     fetch(`${BASE_URL}/api/Bookings/doctor/${doctor.id}/patients`)
//                         .then(res => res.ok ? res.json() : [])
//                 )
//             );

//             const slotsMap = doctorsData.reduce((acc, doctor, index) => {
//                 acc[doctor.id] = slotsData[index];
//                 return acc;
//             }, {});

//             setAvailableSlots(slotsMap);
//         } catch (err) {
//             setError(err.message || 'Failed to load data');
//             console.error('Error:', err);
//         } finally {
//             setLoading(false);
//         }
//     }, [patientId]); // Add all dependencies here

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]); // Now depends on the memoized fetchData

//     const handleBookAppointment = async (doctorId) => {
//         try {
//             const response = await fetch(`${BASE_URL}/api/Bookings`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     patientId,
//                     doctorId,
//                     date: new Date().toISOString(),
//                     status: 'pending'
//                 })
//             });

//             if (!response.ok) throw new Error('Booking failed');
//             const newBooking = await response.json();
//             console.log('Booking successful:', newBooking);
//             navigate(`/Receptionist/Patient/${patientId}/BookingConfirmation/${newBooking.id}`);
//         } catch (err) {
//             setError(err.message || 'Booking error');
//         }
//     };

//     if (loading) return <div className="loading-screen">Loading...</div>;
//     if (error) return <div className="error-screen">{error}</div>;
//     if (!patient) return <div className="error-screen">Patient not found</div>;

//     return (
//         <div className="booking-container">
//             <Patientoption />
            
//             <div className="booking-header">
//                 <h2>Book Appointment</h2>
//                 <p className="patient-name">{patient.firstName} {patient.lastName}</p>
//             </div>
            
//             <div className="doctors-grid">
//                 {doctors.map(doctor => {
//                     const slots = availableSlots[doctor.id] || [];
//                     return (
//                         <DoctorCard 
//                             key={doctor.id}
//                             doctor={doctor}
//                             slots={slots}
//                             onBook={() => handleBookAppointment(doctor.id)}
//                         />
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// const DoctorCard = React.memo(({ doctor, slots, onBook }) => (
//     <div className={`doctor-card ${slots.length ? '' : 'unavailable'}`}>
//         <div className="doctor-image">
//             <img 
//                 // src={doctor.image || '/default-doctor.png'} 
//                 alt={doctor.name}
//                 onError={(e) => e.target.src = '/default-doctor.png'}
//             />
//         </div>
//         <div className="doctor-details">
//             <h3>{doctor.name}</h3>
//             <p className="specialty">{doctor.specialty || 'General Dentist'}</p>
//             <div className="availability">
//                 <span className={`indicator ${slots.length ? 'available' : 'unavailable'}`}></span>
//                 {slots.length ? `${slots.length} slots available` : 'No slots'}
//             </div>
//             {slots.length > 0 && (
//                 <button className="book-btn" onClick={onBook}>
//                     Book Now
//                 </button>
//             )}
//         </div>
//     </div>
// ));

// export default Booking;