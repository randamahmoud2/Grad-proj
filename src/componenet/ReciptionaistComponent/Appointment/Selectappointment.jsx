import './Appointment.css';
import user from "../../../image/doc2.png"
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patientoption } from '../patientData/patientoption';
import Sidebar from '../ReciptionaistSidebar/Sidebar';

const SelectAppoint = () => {
     const [selectedDay, setSelectedDay] = useState(null);
     const [selectedTime, setSelectedTime] = useState(null);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState(null);
     const [availableSlots, setAvailableSlots] = useState([]);
     const [doctor, setDoctor] = useState(null);
     const [availableDays, setAvailableDays] = useState([]);
     const navigate = useNavigate();
     const { docId,id } = useParams();

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
               const patientId = id;
               console.log('Patient ID:', patientId);
               console.log('Doctor ID:', docId);
               console.log('Selected Day:', selectedDay);
                console.log('Selected Time:', selectedTime);
                console.log('Doctor Details:', doctor);
               console.log('Available Days:', availableDays);
               console.log('Available Slots:', availableSlots);
               console.log('Available Time Slots:', getAvailableTimeSlots());
               console.log(selectedDay);
               console.log('Selected Time Slot:', selectedTime);
               if (!patientId) {
                   throw new Error('Patient ID not found. Please login again.');
               }

            //    alert(`Booking appointment for patient ID: ${patientId}, doctor ID: ${docId}, date: ${selectedDay}, time: ${selectedTime}`);
               // Prepare appointment data according to backend DTO
               const appointmentData = {
                   patientId: parseInt(patientId),
                   doctorId: parseInt(docId),
                   appointmentDate: selectedDay,
                   timeSlot: selectedTime
               };
   
               const response = await fetch(`http://localhost:5068/api/appointments`, {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                   },
                   body: JSON.stringify(appointmentData)
               });
   
               if (!response.ok) {
                   const errorData = await response.json();
                   throw new Error(errorData.message || 'Failed to book appointment');
               }
   
               const appointmentResponse = await response.json();
                console.log('Appointment booked successfully:', appointmentResponse);
               // Navigate to show appointment with the response data
            navigate(`/Receptionist/Patient/${id}`,{
                state: { appointment: appointmentResponse }
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
        <div>
            <div className='side-menu1'style={{marginTop:"-80px"}} >
                <Sidebar/>
                </div>
           <div className="Appointment1" style={{marginTop:"60px"}} >
                <Patientoption />
           <div className='data2'>
                <div className='title2'>
                    <p>Doctor Slots</p>
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
                                        }}
                                        >
                                           <p>{day.day}</p>
                                           <p>{day.date.split('-')[2]}</p>
                                       </button>
                                   ))}
                               </div>

                               <div className="time2">
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
       </div>
       );
};

export default SelectAppoint;
