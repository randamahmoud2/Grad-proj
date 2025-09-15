import "./ShowAppointment.css";
import user from "../../../image/doc2.png"
import React, { useEffect, useState } from 'react';

const ShowAppointment = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {

                const patientId = localStorage.getItem('patientId');
                
                const response = await fetch(`http://localhost:5068/api/Appointments/patient/${patientId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const data = await response.json();
                setAppointments(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching appointments:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const cancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(`http://localhost:5068/api/Appointments/${appointmentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to cancel appointment');
            }

            // تحديث القائمة المحلية بعد الإلغاء الناجح
            setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
        } catch (err) {
            setError(err.message);
            console.error('Error cancelling appointment:', err);
        }
    };

    if (isLoading) {
        return <div className="loading">Loading appointments...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="summary">
            <div className='data2'>
                <div className='title2'>
                    <p>My Appointments</p>
                </div>
            </div>
            <hr id="split" />

            {appointments.length === 0 ? (
                <h3 style={{ color: 'rgba(70, 70, 70, 0.63)', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' }}>
                    Oops! There Are No Appointments
                </h3>
            ) : (
                appointments.map((appt) => (
                    <div key={appt.id}>
                        <div className='booking-summary'>
                            <div className='summary-doc'>
                                <div>
                                    <img src={appt.doctor?.image || user} alt="Doctor" />
                                </div>
                                <div className='summary-info'>
                                    <p className='appointment-doc-name'>{appt.doctor?.name || 'Doctor'}</p>
                                    <p style={{ color: "rgba(56, 56, 180, 0.7)" }}>
                                        <strong style={{ color: "#357adb" }}>Day & Time:</strong><br />
                                        {new Date(appt.appointmentDate).toLocaleDateString()} | {appt.timeSlot}
                                    </p>
                                    <p>Status: {appt.status}</p>
                                </div>
                            </div>
                            { appt.status.toLowerCase()!=='paid' && appt.status.toLowerCase()!=='complete' && 
                            
                            
                            <div className='cancel'>
                                {appt.status !== 'Cancelled' && (
                                    <button onClick={() => cancelAppointment(appt.id)}>
                                        Cancel Appointment
                                    </button>
                                )}
                            </div>
}
                        </div>
                        <hr id="split" />
                    </div>
                ))
            )}
        </div>
    );
};

export default ShowAppointment;