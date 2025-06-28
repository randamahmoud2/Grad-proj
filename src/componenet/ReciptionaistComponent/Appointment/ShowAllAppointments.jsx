import './ShowAppointment.css';
import user from '../../../image/doc2.png'
import React, { useEffect, useState } from 'react';

const ShowAllAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const API_BASE_URL = 'http://localhost:5068/api/Appointments';

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const data = await response.json();
                setAppointments(data);
                localStorage.setItem('appointments', JSON.stringify(data));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [refresh]);

    const cancelAppointment = async (indexToRemove) => {
        const appointmentId = appointments[indexToRemove].id;
        try {
            const response = await fetch(`${API_BASE_URL}/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to cancel appointment');
            }

            setRefresh(!refresh);
            alert("Appointment cancelled successfully");
        } catch (err) {
            setError(err.message);
        }
    };

    const AppointmentPaid = async (indexToUpdate) => {
        const appointmentId = appointments[indexToUpdate].id;
        try {
            const response = await fetch(`${API_BASE_URL}/${appointmentId}/paid`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update payment status');
            }

            setRefresh(!refresh);
            alert("Appointment marked as paid successfully");
        } catch (err) {
            setError(err.message);
        }
    };

    const renderStatusBadge = (status, index) => {
        switch(status) {
            case "Paid":
            case "Completed":
                return (
                    <div className='paid1'>
                        ✔ Complete
                    </div>
                );
            case "Cancelled":
                return (
                    <div className='cancelled1' style={{ color: 'red', fontWeight: 'bold' }}>
                        ✘ Cancelled
                    </div>
                );
            default:
                return (
                    <>
                        <button onClick={() => AppointmentPaid(index)}>Cash Payment</button>
                        <button onClick={() => cancelAppointment(index)}>Cancel Appointment</button>
                    </>
                );
        }
    };

    return (
        <div className="summary">
            <div className='data2'>
                <div className='title2'>
                    <p>Patients Appointments</p>
                </div>
            </div>
            <hr id="split" />

            {loading && <p>Loading appointments...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && appointments.length === 0 ? (
                <h3 className='error-message'>
                    Oops! There Is No Appointment
                </h3>
            ) : (
                
                appointments.map((appt, index) => (
                    <div key={appt.id}>
                        {console.log(appt.patient.name)}
                        <div className='booking-summary'>
                            <div className='summary-doc'>
                                <div>
                                <img src={appt.doctor?.image || user} alt="Doctor" />
                                </div>
                                <div className='summary-info'>
                                    <p className='appointment-doc-name'>
                                       {appt.doctor.name} | {appt.patient.name}
                                    </p>
                                    <strong style={{ color: '#357adb' }}>Day & Time: </strong>
                                    <p style={{ color: 'rgba(66, 66, 68, 0.7)', fontSize:"16px" }}>
                                        {(() => {
                                            const date = new Date(appt.appointmentDate);
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const year = date.getFullYear();
                                            const hours = String(date.getHours()).padStart(2, '0');
                                            const minutes = String(date.getMinutes()).padStart(2, '0');

                                            return `${day}-${month}-${year} | ${hours}:${minutes}`;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <div className='cancel'>
                                {renderStatusBadge(appt.status, index)}
                            </div>
                        </div>
                        <hr id="split" />
                    </div>
                ))
            )}
        </div>
    );
};

export default ShowAllAppointments;