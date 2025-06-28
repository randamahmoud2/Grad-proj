import './Appointment.css';
import user from "../../../image/doc2.png"
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Appointment = () => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [availableDays, setAvailableDays] = useState([]);
    const navigate = useNavigate();
    const { docId } = useParams();

    // Fetch doctor data when component mounts
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:5068/api/Doctors/${docId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch doctor data');
                }
                const data = await response.json();
                setDoctor(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchAvailableSlots = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch available slots');
                }
                const data = await response.json();
                setAvailableSlots(data);
                console.log('Available Slots:', data);
                // Extract unique days from available slots
                const uniqueDays = [...new Set(data.map(slot => slot.dayOfWeek))]
                    .map(day => {
                        // Convert dayOfWeek (0-6) to actual date
                        const date = new Date();
                        const daysUntilNext = (day - date.getDay() + 7) % 7;
                        date.setDate(date.getDate() + daysUntilNext);
                        
                        return {
                            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                            date: date.toISOString().split('T')[0],
                            dayOfWeek: day
                        };
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
                
                setAvailableDays(uniqueDays);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctor();
        fetchAvailableSlots();
    }, [docId]);

    // Filter time slots based on available slots for selected day
    const getAvailableTimeSlots = () => {
        if (!selectedDay) return [];
        
        // Find the dayOfWeek for the selected date
        const selectedDayObj = availableDays.find(day => day.date === selectedDay);
        if (!selectedDayObj) return [];
        
        return availableSlots
            .filter(slot => 
                slot.dayOfWeek === selectedDayObj.dayOfWeek && 
                slot.isAvailable
            )
            .map(slot => slot.timeSlot)
            .sort((a, b) => {
                // Simple time comparison for sorting
                const timeToMinutes = (time) => {
                    const [timePart, period] = time.split(' ');
                    const [hours, minutes] = timePart.split(':').map(Number);
                    let total = hours % 12 * 60 + minutes;
                    if (period === 'PM' && hours !== 12) total += 12 * 60;
                    return total;
                };
                return timeToMinutes(a) - timeToMinutes(b);
            });
    };

    const handleBookAppointment = async () => {
        if (!selectedDay || !selectedTime || !doctor) return;

        setIsLoading(true);
        setError(null);

        try {
            // Get patientId from localStorage
            const patientId = localStorage.getItem('patientId');
            if (!patientId) {
                throw new Error('Patient ID not found. Please login again.');
            }

            // Prepare appointment data according to backend DTO
            const appointmentData = {
                patientId: parseInt(patientId),
                doctorId: parseInt(docId),
                appointmentDate: selectedDay,
                timeSlot: selectedTime
            };
               console.log(selectedDay);
            const response = await fetch(`http://localhost:5068/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Booking error:', errorData);
                throw new Error(errorData.message || 'Failed to book appointment');
            }

            const appointmentResponse = await response.json();

            // Navigate to show appointment with the response data
            navigate('/Patient/ShowAppointment', {
                state: {
                    appointment: appointmentResponse,
                    bookingDetails: {
                        doctorName: doctor.name,
                        specialty: doctor.specialty,
                        date: selectedDay,
                        time: selectedTime,
                        fee: doctor.fee
                    }
                }
            });

        } catch (err) {
            setError(err.message);
            console.error('Booking error:', err);
            
            // Redirect to login if patient ID is missing
            if (err.message.includes('Patient ID not found')) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="Appointment1">
            <div className='data2'>
                <div className='title2'>
                    <p>Appointments</p>
                </div>
            </div>
            <hr id="split"/>
            
            <div>
                {doctor ? (
                <div className="body">
                    <div className="DocPhoto">
                        <img 
                            src={doctor.imageUrl || user} 
                        />
                    </div>

                    <div className="bookSlots">
                        <div className='DocInfo'>
                            <div className="info">
                                <p className='docname'>{doctor.name}</p>
                            {/* <p className="doctor-specialty">Specialization: {doctor.specialty}</p> */}
                                <div>
                                    <p className='doc-about'>About </p>
                                    <p className='doc-about-p'>
                                        Dr. Heba has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Heba has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.
                                    </p>
                                </div>
                                <p className='doc-price'>Appointment fee: ${doctor.fee}</p>
                            </div>
                        </div>
                
                        <h3 className="booking-title">Booking slots</h3>
                        <div className="slots">
                            <div className="dateTime">
                                {availableDays.map((day, index) => (
                                    <button
                                        key={index}
                                        className={`date-button ${selectedDay === day.date ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedDay(day.date);
                                            setSelectedTime(null);
                                    }}>
                                        <p>{day.day}</p>
                                        <p>{day.date.split('-')[2]}</p>
                                    </button>
                                ))}
                            </div> 
                            <div className="time1">
                                {getAvailableTimeSlots().map((time, index) => (
                                    <button
                                        key={index}
                                        className={`${selectedTime === time ? "button selected" : "button"}`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button
                            className={`book ${(!selectedDay || !selectedTime || isLoading) ? "disabled" : ""}`}
                            disabled={!selectedDay || !selectedTime || isLoading}
                            onClick={handleBookAppointment}
                            >
                                {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Booking...
                                </>
                                    ) : (
                                    'Confirm Appointment'
                                )}
                        </button>
                    </div>
                </div>
                ) : (
                <div className="loading-section">
                    {isLoading ? (
                        <div className="loading-spinner"></div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div>Loading doctor information...</div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default Appointment;











// import './Appointment.css';
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const Appointment = () => {
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const [doctor, setDoctor] = useState(null);
//     const [availableDays, setAvailableDays] = useState([]);
//     const navigate = useNavigate();
    
//     const { docId } = useParams();

//     // Fetch doctor data when component mounts
//     useEffect(() => {
//         const fetchDoctor = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/Doctors/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch doctor data');
//                 }
//                 const data = await response.json();
//                 setDoctor(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         const fetchAvailableSlots = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch available slots');
//                 }
//                 const data = await response.json();
//                 setAvailableSlots(data);
                
//                 // Extract unique days from available slots
//                 const uniqueDays = [...new Set(data.map(slot => slot.dayOfWeek))]
//                     .map(day => {
//                         // Convert dayOfWeek (0-6) to actual date
//                         const date = new Date();
//                         const daysUntilNext = (day - date.getDay() + 7) % 7;
//                         date.setDate(date.getDate() + daysUntilNext);
                        
//                         return {
//                             day: date.toLocaleDateString('en-US', { weekday: 'short' }),
//                             date: date.toISOString().split('T')[0],
//                             dayOfWeek: day
//                         };
//                     })
//                     .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
                
//                 setAvailableDays(uniqueDays);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchDoctor();
//         fetchAvailableSlots();
//     }, [docId]);

//     // Filter time slots based on available slots for selected day
//     const getAvailableTimeSlots = () => {
//         if (!selectedDay) return [];
        
//         // Find the dayOfWeek for the selected date
//         const selectedDayObj = availableDays.find(day => day.date === selectedDay);
//         if (!selectedDayObj) return [];
        
//         return availableSlots
//             .filter(slot => 
//                 slot.dayOfWeek === selectedDayObj.dayOfWeek && 
//                 slot.isAvailable
//             )
//             .map(slot => slot.timeSlot)
//             .sort((a, b) => {
//                 // Simple time comparison for sorting
//                 const timeToMinutes = (time) => {
//                     const [timePart, period] = time.split(' ');
//                     const [hours, minutes] = timePart.split(':').map(Number);
//                     let total = hours % 12 * 60 + minutes;
//                     if (period === 'PM' && hours !== 12) total += 12 * 60;
//                     return total;
//                 };
//                 return timeToMinutes(a) - timeToMinutes(b);
//             });
//     };

//     const handleBookAppointment = async () => {
//         if (!selectedDay || !selectedTime || !doctor) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             // Get patientId from localStorage
//             const patientId = localStorage.getItem('patientId');
//             if (!patientId) {
//                 throw new Error('Patient ID not found. Please login again.');
//             }

//             // Prepare appointment data according to backend DTO
//             const appointmentData = {
//                 patientId: parseInt(patientId),
//                 doctorId: parseInt(docId),
//                 appointmentDate: selectedDay,
//                 timeSlot: selectedTime
//             };

//             const response = await fetch(`http://localhost:5068/api/appointments`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(appointmentData)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to book appointment');
//             }

//             const appointmentResponse = await response.json();

//             // Navigate to show appointment with the response data
//             navigate('/Patient/ShowAppointment', {
//                 state: {
//                     appointment: appointmentResponse,
//                     bookingDetails: {
//                         doctorName: doctor.name,
//                         specialty: doctor.specialty,
//                         date: selectedDay,
//                         time: selectedTime,
//                         fee: doctor.fee
//                     }
//                 }
//             });

//         } catch (err) {
//             setError(err.message);
//             console.error('Booking error:', err);
            
//             // Redirect to login if patient ID is missing
//             if (err.message.includes('Patient ID not found')) {
//                 navigate('/login');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className='Appointment1'>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Appointments</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div>
//             {doctor && 
//                 <div className='body'>
//                     <div className='DocPhoto'>
//                         <img src={doctor.imageUrl || 'default-doctor-image.jpg'} alt={doctor.name} />
//                     </div>
//                     <div className='bookSlots'>

//                         <div className='DocInfo'>
//                             <div className='info'>
//                                 <p className='docname'>{doctor.name}</p>
//                                 <div>
//                                     <p className='doc-about'>Specialty: {doctor.specialty}</p>
//                                     <p className='doc-about'>About </p>
//                                     <p className='doc-about-p' >
//                                         {doctor.bio}
//                                     </p>
//                                     <p className='doc-about'>Location: {doctor.location}</p>
//                                 </div>
//                                 <p className='doc-price'>Appointment fee: ${doctor.fee}</p>
//                             </div>
//                         </div>

//                         <h3 className="section-title">Booking slots</h3>
//                         <div className="slots">
//                             <div className='dateTime'>
//                                 {availableDays.map((day, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedDay === day.date ? "selected" : ""}
//                                         onClick={() => {
//                                             setSelectedDay(day.date);
//                                             setSelectedTime(null);
//                                         }}
//                                     >
//                                         <p>{day.day}</p>
//                                         <p>{day.date.split('-')[2]}</p>
//                                     </button>
//                                 )}
//                             </div>
//                             <div className='time1'>
//                                 {getAvailableTimeSlots().length > 0 ? (
//                                     getAvailableTimeSlots().map((time, index) =>
//                                         <button 
//                                             key={index} 
//                                             className={selectedTime === time ? "button selected" : "button"}
//                                             onClick={() => setSelectedTime(time)}
//                                         >
//                                             {time}
//                                         </button>
//                                     )
//                                 ) : (
//                                     selectedDay ? <p>No available slots for this day</p> : <p>Please select a day</p>
//                                 )}
//                             </div>
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button 
//                             className='book' 
//                             disabled={!selectedDay || !selectedTime || isLoading}
//                             onClick={handleBookAppointment}
//                         >                           
//                             {isLoading ? 'Booking...' : 'Book An Appointment'}
//                         </button>

//                     </div>
//                 </div>}
//             {!doctor && isLoading && <div>Loading doctor information...</div>}
//             {!doctor && !isLoading && error && <div className="error-message">{error}</div>}
//             </div>
//         </div>
//     )
// }

// export default Appointment;























// import './Appointment.css';
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const Appointment = () => {
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const [doctor, setDoctor] = useState(null);
//     const [availableDays, setAvailableDays] = useState([]);
//     const navigate = useNavigate();
    
//     const { docId } = useParams();

//     // Fetch doctor data when component mounts
//     useEffect(() => {
//         const fetchDoctor = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/Doctors/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch doctor data');
//                 }
//                 const data = await response.json();
//                 setDoctor(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         const fetchAvailableSlots = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch available slots');
//                 }
//                 const data = await response.json();
//                 setAvailableSlots(data);
                
//                 // Extract unique days from available slots
//                 const uniqueDays = [...new Set(data.map(slot => slot.dayOfWeek))]
//                     .map(day => {
//                         // Convert dayOfWeek (0-6) to actual date
//                         const date = new Date();
//                         const daysUntilNext = (day - date.getDay() + 7) % 7;
//                         date.setDate(date.getDate() + daysUntilNext);
                        
//                         return {
//                             day: date.toLocaleDateString('en-US', { weekday: 'short' }),
//                             date: date.toISOString().split('T')[0],
//                             dayOfWeek: day
//                         };
//                     })
//                     .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
                
//                 setAvailableDays(uniqueDays);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchDoctor();
//         fetchAvailableSlots();
//     }, [docId]);

//     // Filter time slots based on available slots for selected day
//     const getAvailableTimeSlots = () => {
//         if (!selectedDay) return [];
        
//         // Find the dayOfWeek for the selected date
//         const selectedDayObj = availableDays.find(day => day.date === selectedDay);
//         if (!selectedDayObj) return [];
        
//         return availableSlots
//             .filter(slot => 
//                 slot.dayOfWeek === selectedDayObj.dayOfWeek && 
//                 slot.isAvailable
//             )
//             .map(slot => slot.timeSlot)
//             .sort((a, b) => {
//                 // Simple time comparison for sorting
//                 const timeToMinutes = (time) => {
//                     const [timePart, period] = time.split(' ');
//                     const [hours, minutes] = timePart.split(':').map(Number);
//                     let total = hours % 12 * 60 + minutes;
//                     if (period === 'PM' && hours !== 12) total += 12 * 60;
//                     return total;
//                 };
//                 return timeToMinutes(a) - timeToMinutes(b);
//             });
//     };

//     const handleBookAppointment = async () => {
//         if (!selectedDay || !selectedTime || !doctor) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const appointmentData = {
//                 doctorId: parseInt(docId),
//                 appointmentDate: selectedDay,
//                 timeSlot: selectedTime
//             };

//             const response = await fetch(`http://localhost:5068/api/appointments`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(appointmentData)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to book appointment');
//             }

//             const appointment = await response.json();

//             // Save to local storage
//             const existingAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
//             existingAppointments.push({
//                 id: appointment.id,
//                 doctor,
//                 date: selectedDay,
//                 time: selectedTime
//             });
//             localStorage.setItem("appointments", JSON.stringify(existingAppointments));

//             navigate('/Patient/ShowAppointment', {
//                 state: appointment
//             });
//         } catch (err) {
//             setError(err.message);
//             console.error('Booking error:', err);
//         } finally {
//             setIsLoading(false);
//         }
    
//     };

//     return (
//         <div className='Appointment1'>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Appointments</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div>
//             {doctor && 
//                 <div className='body'>
//                     <div className='DocPhoto'>
//                         <img src={doctor.imageUrl || 'default-doctor-image.jpg'} alt={doctor.name} />
//                     </div>
//                     <div className='bookSlots'>

//                         <div className='DocInfo'>
//                             <div className='info'>
//                                 <p className='docname'>{doctor.name}</p>
//                                 <div>
//                                     <p className='doc-about'>Specialty: {doctor.specialty}</p>
//                                     <p className='doc-about'>About </p>
//                                     <p className='doc-about-p' >
//                                         {doctor.bio}
//                                     </p>
//                                     <p className='doc-about'>Location: {doctor.location}</p>
//                                 </div>
//                                 <p className='doc-price'>Appointment fee: ${doctor.fee}</p>
//                             </div>
//                         </div>

//                         <h3 className="section-title">Booking slots</h3>
//                         <div className="slots">
//                             <div className='dateTime'>
//                                 {availableDays.map((day, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedDay === day.date ? "selected" : ""}
//                                         onClick={() => {
//                                             setSelectedDay(day.date);
//                                             setSelectedTime(null);
//                                         }}
//                                     >
//                                         <p>{day.day}</p>
//                                         <p>{day.date.split('-')[2]}</p>
//                                     </button>
//                                 )}
//                             </div>
//                             <div className='time1'>
//                                 {getAvailableTimeSlots().length > 0 ? (
//                                     getAvailableTimeSlots().map((time, index) =>
//                                         <button 
//                                             key={index} 
//                                             className={selectedTime === time ? "button selected" : "button"}
//                                             onClick={() => setSelectedTime(time)}
//                                         >
//                                             {time}
//                                         </button>
//                                     )
//                                 ) : (
//                                     selectedDay ? <p>No available slots for this day</p> : <p>Please select a day</p>
//                                 )}
//                             </div>
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button 
//                             className='book' 
//                             disabled={!selectedDay || !selectedTime || isLoading}
//                             onClick={handleBookAppointment}
//                         >                           
//                             {isLoading ? 'Booking...' : 'Book An Appointment'}
//                         </button>

//                     </div>
//                 </div>}
//             {!doctor && isLoading && <div>Loading doctor information...</div>}
//             {!doctor && !isLoading && error && <div className="error-message">{error}</div>}
//             </div>
//         </div>
//     )
// }

// export default Appointment;


// import './Appointment.css';
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const Appointment = () => {
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const [doctor, setDoctor] = useState(null);
//     const [availableDays, setAvailableDays] = useState([]);
//     const [allTimeSlots, setAllTimeSlots] = useState([]);
//     const navigate = useNavigate();
    
//     const { docId } = useParams();

//     // Fetch doctor data when component mounts
//     useEffect(() => {
//         const fetchDoctor = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/Doctors/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch doctor data');
//                 }
//                 const data = await response.json();
//                 console.log('Doctor data:', data);
//                 setDoctor(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         const fetchAvailableSlots = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch available slots');
//                 }
//                 const data = await response.json();
//                 console.log('Available slots:', data);
//                 setAvailableSlots(data);
                
//                 // Extract unique days from available slots
//                 const uniqueDays = [...new Set(data.map(slot => slot.DayOfWeek))].map(day => {
//                     const date = new Date();
//                     date.setDate(date.getDate() + (day - date.getDay() + 7) % 7);
//                     return {
//                         day: date.toLocaleDateString('en-US', { weekday: 'short' }),
//                         date: date.toISOString().split('T')[0],
//                         dayOfWeek: day
//                     };
//                 });
//                 setAvailableDays(uniqueDays);
                
//                 // Extract all unique time slots
//                 const uniqueTimeSlots = [...new Set(data.map(slot => slot.TimeSlot))];
//                 setAllTimeSlots(uniqueTimeSlots);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchDoctor();
//         fetchAvailableSlots();
//     }, [docId]);

//     // Filter time slots based on available slots for selected day
//     const getAvailableTimeSlots = () => {
//         if (!selectedDay) return [];
        
//         // Find the dayOfWeek for the selected date
//         const selectedDayObj = availableDays.find(day => day.date === selectedDay);
//         if (!selectedDayObj) return [];
        
//         return availableSlots
//             .filter(slot => 
//                 slot.DayOfWeek === selectedDayObj.dayOfWeek && slot.IsAvailable
//             )
//             .map(slot => slot.TimeSlot);
//     };

//     const handleBookAppointment = async () => {
//         if (!selectedDay || !selectedTime || !doctor) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const appointmentData = {
//                 doctorId: parseInt(docId),
//                 appointmentDate: selectedDay,
//                 timeSlot: selectedTime
//             };

//             const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(appointmentData)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to book appointment');
//             }

//             const appointment = await response.json();

//             // Save to local storage
//             const existingAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
//             existingAppointments.push({
//                 ID: appointment.id,
//                 doctor,
//                 day: selectedDay,
//                 time: selectedTime
//             });
//             localStorage.setItem("appointments", JSON.stringify(existingAppointments));

//             navigate('/Patient/ShowAppointment', {
//                 state: appointment
//             });
//         } catch (err) {
//             setError(err.message);
//             console.error('Booking error:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className='Appointment1'>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Appointments</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div>
//             {doctor && 
//                 <div className='body'>
//                     <div className='DocPhoto'>
//                         <img src={doctor.ImageUrl || 'default-doctor-image.jpg'} alt={doctor.Name} />
//                     </div>
//                     <div className='bookSlots'>

//                         <div className='DocInfo'>
//                             <div className='info'>
//                                 <p className='docname'>{doctor.Name}</p>
//                                 <div>
//                                     <p className='doc-about'>Specialty: {doctor.Specialty}</p>
//                                     <p className='doc-about'>About </p>
//                                     <p className='doc-about-p' >
//                                         {doctor.Bio}
//                                     </p>
//                                     <p className='doc-about'>Location: {doctor.Location}</p>
//                                 </div>
//                                 <p className='doc-price'>Appointment fee: {doctor.Fee}</p>
//                             </div>
//                         </div>

//                         <h3 className="section-title">Booking slots</h3>
//                         <div className="slots">
//                             <div className='dateTime'>
//                                 {availableDays.map((day, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedDay === day.date ? "selected" : ""}
//                                         onClick={() => {
//                                             setSelectedDay(day.date);
//                                             setSelectedTime(null);
//                                         }}
//                                     >
//                                         <p>{day.day}</p>
//                                         <p>{day.date.split('-')[2]}</p>
//                                     </button>
//                                 )}
//                             </div>
//                             <div className='time1'>
//                                 {getAvailableTimeSlots().map((time, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedTime === time ? "button selected" : "button"}
//                                         onClick={() => setSelectedTime(time)}
//                                         disabled={!selectedDay}
//                                     >
//                                         {time}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button 
//                             className='book' 
//                             disabled={!selectedDay || !selectedTime || isLoading}
//                             onClick={handleBookAppointment}
//                         >                           
//                             {isLoading ? 'Booking...' : 'Book An Appointment'}
//                         </button>

//                     </div>
//                 </div>}
//             {!doctor && isLoading && <div>Loading doctor information...</div>}
//             {!doctor && !isLoading && error && <div className="error-message">{error}</div>}
//             </div>
//         </div>
//     )
// }

// export default Appointment;





















// import './Appointment.css';
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const Appointment = () => {
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const [doctor, setDoctor] = useState(null);
//     const navigate = useNavigate();
    
//     const bookingDays = [
//         { day: "Wed", date: "2025-04-19" },
//         { day: "Thu", date: "2025-04-20" },
//         { day: "Fri", date: "2025-04-21" },
//         { day: "Sat", date: "2025-04-22" },
//         { day: "Sun", date: "2025-04-23" },
//         { day: "Mon", date: "2025-04-24" },
//         { day: "Tue", date: "2025-04-25" },
//     ];

//     const { docId } = useParams();
//     const allTimeSlots = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

//     // Fetch doctor data when component mounts
//     useEffect(() => {
//         const fetchDoctor = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/Doctors/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch doctor data');
//                 }
//                 const data = await response.json();
//                 setDoctor(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         const fetchAvailableSlots = async () => {
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch available slots');
//                 }
//                 const data = await response.json();
//                 setAvailableSlots(data);
//             } catch (err) {
//                 setError(err.message);
//             }
//         };

//         fetchDoctor();
//         fetchAvailableSlots();
//     }, [docId]);

//     // Filter time slots based on available slots for selected day
//     const getAvailableTimeSlots = () => {
//         if (!selectedDay) return allTimeSlots;
        
//         const slotsForDay = availableSlots.filter(slot => 
//             slot.appointmentDate === selectedDay
//         );
        
//         return allTimeSlots.filter(time => 
//             slotsForDay.some(slot => slot.timeSlot === time)
//         );
//     };

//     const handleBookAppointment = async () => {
//         if (!selectedDay || !selectedTime || !doctor) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const appointmentData = {
//                 doctorId: parseInt(docId),
//                 appointmentDate: selectedDay,
//                 timeSlot: selectedTime
//             };

//             const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(appointmentData)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to book appointment');
//             }

//             const appointment = await response.json();

//             // Save to local storage
//             const existingAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
//             existingAppointments.push({
//                 ID: appointment.id,
//                 doctor,
//                 day: selectedDay,
//                 time: selectedTime
//             });
//             localStorage.setItem("appointments", JSON.stringify(existingAppointments));

//             navigate('/Patient/ShowAppointment', {
//                 state: appointment
//             });
//         } catch (err) {
//             setError(err.message);
//             console.error('Booking error:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className='Appointment1'>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Appointments</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div>
//             {doctor  && 
//                 <div className='body'>
//                     <div className='DocPhoto'>
//                         <img src={doctor.ImageUrl || 'default-doctor-image.jpg'} alt={doctor.Name} />
//                     </div>
//                     <div className='bookSlots'>

//                         <div className='DocInfo'>
//                             <div className='info'>
//                                 <p className='docname'>{doctor.Name}</p>
//                                 <div>
//                                     <p className='doc-about'>Specialty: {doctor.Specialty}</p>
//                                     <p className='doc-about'>About </p>
//                                     <p className='doc-about-p' >
//                                         {doctor.Bio}
//                                     </p>
//                                     <p className='doc-about'>Location: {doctor.Location}</p>
//                                 </div>
//                                 <p className='doc-price'>Appointment fee: {doctor.Fee}</p>
//                             </div>
//                         </div>

//                         <h3 className="section-title">Booking slots</h3>
//                         <div className="slots">
//                             <div className='dateTime'>
//                                 {bookingDays.map((day, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedDay === day.date ? "selected" : ""}
//                                         onClick={() => setSelectedDay(day.date)}
//                                     >
//                                         <p>{day.day}</p>
//                                         <p>{day.date.split('-')[2]}</p>
//                                     </button>
//                                 )}
//                             </div>
//                             <div className='time1'>
//                                 {getAvailableTimeSlots().map((time, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedTime === time ? "button selected" : "button"}
//                                         onClick={() => setSelectedTime(time)}
//                                         disabled={!selectedDay}
//                                     >
//                                         {time}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button 
//                             className='book' 
//                             disabled={!selectedDay || !selectedTime || isLoading}
//                             onClick={handleBookAppointment}
//                         >                           
//                             {isLoading ? 'Booking...' : 'Book An Appointment'}
//                         </button>

//                     </div>
//                 </div>}
//             {doctor && (
//                 <div className="error-message">This doctor is currently not available for appointments</div>
//             )}
//             {!doctor && isLoading && <div>Loading doctor information...</div>}
//             {!doctor && !isLoading && error && <div className="error-message">{error}</div>}
//             </div>
//         </div>
//     )
// }

// export default Appointment;































































































// import './Appointment.css';
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import all_product from '../../Assets/all_product';

// const Appointment = () => {
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [availableSlots, setAvailableSlots] = useState([]);
//     const navigate = useNavigate();
    
//     const bookingDays = [
//         { day: "Wed", date: "2025-04-19" },
//         { day: "Thu", date: "2025-04-20" },
//         { day: "Fri", date: "2025-04-21" },
//         { day: "Sat", date: "2025-04-22" },
//         { day: "Sun", date: "2025-04-23" },
//         { day: "Mon", date: "2025-04-24" },
//         { day: "Tue", date: "2025-04-25" },
//     ];

//     const { docId } = useParams();
//     const doctor = all_product.find((item) => item.id.toString() === docId);
//     console.log(doctor);
//     const allTimeSlots = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

//     // Fetch available slots when component mounts
//     useEffect(() => {
//         const fetchAvailableSlots = async () => {
//             alert(docId);
//             try {
//                 setIsLoading(true);
//                 const response = await fetch(`http://localhost:5068/api/schedule/available/${docId}`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch available slots');
//                 }
//                 const data = await response.json();
//                 console.log('Available slots:', data);
//                 setAvailableSlots(data);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchAvailableSlots();
//     }, [docId]);

//     // Filter time slots based on available slots for selected day
//     const getAvailableTimeSlots = () => {
//         if (!selectedDay) return allTimeSlots;
        
//         const slotsForDay = availableSlots.filter(slot => 
//             slot.appointmentDate === selectedDay
//         );
        
//         return allTimeSlots.filter(time => 
//             slotsForDay.some(slot => slot.timeSlot === time)
//         );
//     };

//     const handleBookAppointment = async () => {
//         if (!selectedDay || !selectedTime) return;

//         setIsLoading(true);
//         setError(null);

//         try {
//             const appointmentData = {
//                 doctorId: parseInt(docId),
//                 appointmentDate: selectedDay,
//                 timeSlot: selectedTime
//             };

//             const response = await fetch(`http://localhost:5068/api/schedule/book`, { // Changed endpoint
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(appointmentData)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to book appointment');
//             }

//             const appointment = await response.json();

//             // Save to local storage
//             const existingAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
//             existingAppointments.push({
//                 ID: appointment.id,
//                 doctor,
//                 day: selectedDay,
//                 time: selectedTime
//             });
//             localStorage.setItem("appointments", JSON.stringify(existingAppointments));

//             navigate('/Patient/ShowAppointment', {
//                 state: appointment
//             });
//         } catch (err) {
//             setError(err.message);
//             console.error('Booking error:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className='Appointment1'>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Appointments</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div>
//             {doctor && 
//                 <div className='body'>
//                     <div className='DocPhoto'>
//                         <img src={doctor.image} alt="" />
//                     </div>
//                     <div className='bookSlots'>

//                         <div className='DocInfo'>
//                             <div className='info'>
//                                 <p className='docname'>{doctor.name}</p>
//                                 <div>
//                                     <p className='doc-about'>About </p>
//                                     <p className='doc-about-p' >
//                                     {doctor.about}
//                                     </p>
//                                 </div>
//                                 <p className='doc-price'>Appointment fee: {doctor.price}</p>
//                             </div>
//                         </div>

//                         <h3 className="section-title">Booking slots</h3>
//                         <div className="slots">
//                             <div className='dateTime'>
//                                 {bookingDays.map((day, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedDay === day.date ? "selected" : ""}
//                                         onClick={() => setSelectedDay(day.date)}
//                                     >
//                                         <p>{day.day}</p>
//                                         <p>{day.date.split('-')[2]}</p>
//                                     </button>
//                                 )}
//                             </div>
//                             <div className='time1'>
//                                 {getAvailableTimeSlots().map((time, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedTime === time ? "button selected" : "button"}
//                                         onClick={() => setSelectedTime(time)}
//                                         disabled={!selectedDay}
//                                     >
//                                         {time}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button 
//                             className='book' 
//                             disabled={!selectedDay || !selectedTime || isLoading}
//                             onClick={handleBookAppointment}
//                         >                           
//                             {isLoading ? 'Booking...' : 'Book An Appointment'}
//                         </button>

//                     </div>
//                 </div>}
//             </div>
//         </div>
//     )
// }

// export default Appointment;


// import './Appointment.css';
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import all_product from '../../Assets/all_product';

// const Appointment = () => {
//     const [selectedDay, setSelectedDay] = useState(null);
//     const [selectedTime, setSelectedTime] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();
    
//     const bookingDays = [
//         { day: "Wed", date: "2025-04-19" },
//         { day: "Thu", date: "2025-04-20" },
//         { day: "Fri", date: "2025-04-21" },
//         { day: "Sat", date: "2025-04-22" },
//         { day: "Sun", date: "2025-04-23" },
//         { day: "Mon", date: "2025-04-24" },
//         { day: "Tue", date: "2025-04-25" },
//     ];

//     const { docId } = useParams();
//     const doctor = all_product.find((item) => item.id.toString() === docId);
//     const timeSlots = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

//     const handleBookAppointment = async () => {
//         if (!selectedDay || !selectedTime) return;

//         setIsLoading(true);
//         setError(null);

//         try {
         
//             const appointmentData = {
//                 doctorId: parseInt(docId),
//                 appointmentDate: selectedDay, // Format: "YYYY-MM-DD"
//                 timeSlot: selectedTime
//             };

//             const response = await fetch(`http://localhost:5068/api/schedule/available/${doctorId}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(appointmentData)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to book appointment');
//             }

//             const appointment = await response.json();

//             // Save to local storage if needed
//             const existingAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
//             existingAppointments.push({
//                 ID: appointment.id,
//                 doctor,
//                 day: selectedDay,
//                 time: selectedTime
//             });
//             localStorage.setItem("appointments", JSON.stringify(existingAppointments));

//             navigate('/Patient/ShowAppointment', {
//                 state: appointment
//             });
//         } catch (err) {
//             setError(err.message);
//             console.error('Booking error:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className='Appointment1'>
//             <div className='data2'>
//                 <div className='title2'>
//                     <p>Appointments</p>
//                 </div>
//             </div>
//             <hr id="split"/>
//             <div>
//             {doctor && 
//                 <div className='body'>
//                     <div className='DocPhoto'>
//                         <img src={doctor.image} alt="" />
//                     </div>
//                     <div className='bookSlots'>

//                         <div className='DocInfo'>
//                             <div className='info'>
//                                 <p className='docname'>{doctor.name}</p>
//                                 <div>
//                                     <p className='doc-about'>About </p>
//                                     <p className='doc-about-p' >
//                                     {doctor.about}
//                                     </p>
//                                 </div>
//                                 <p className='doc-price'>Appointment fee: {doctor.price}</p>
//                             </div>
//                         </div>

//                         <h3 className="section-title">Booking slots</h3>
//                         <div className="slots">
//                             <div className='dateTime'>
//                                 {bookingDays.map((day, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedDay === day.date ? "selected" : ""}
//                                         onClick={() => setSelectedDay(day.date)}
//                                     >
//                                         <p>{day.day}</p>
//                                         <p>{day.date.split('-')[2]}</p> {/* Display just the day number */}
//                                     </button>
//                                 )}
//                             </div>
//                             <div className='time1'>
//                                 {timeSlots.map((time, index) =>
//                                     <button 
//                                         key={index} 
//                                         className={selectedTime === time ? "button selected" : "button"}
//                                         onClick={() => setSelectedTime(time)}
//                                     >
//                                         {time}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                         {error && <div className="error-message">{error}</div>}
//                         <button 
//                             className='book' 
//                             disabled={!selectedDay || !selectedTime || isLoading}
//                             onClick={handleBookAppointment}
//                         >                           
//                             {isLoading ? 'Booking...' : 'Book An Appointment'}
//                         </button>

//                     </div>
//                 </div>}
//             </div>
//         </div>
//     )
// }

// export default Appointment;