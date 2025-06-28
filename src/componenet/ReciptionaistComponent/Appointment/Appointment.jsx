import '../../patientComponnent/Appointment/Appointment.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Patientoption } from '../patientData/patientoption';
import { FaCalendarAlt, FaUserMd, FaTooth, FaMoneyBillWave, FaCheck, FaClock, FaTimes, FaThumbsUp } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5068';

export const Appointment = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id: patientId } = useParams();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                if (!patientId) {
                    throw new Error('Patient ID is missing');
                }

                const endpoint = `${API_BASE_URL}/api/Appointments/patient/${patientId}`;
                const response = await fetch(endpoint);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to load appointments');
                }

                const data = await response.json();
                const transformedAppointments = Array.isArray(data) 
                    ? data.map(appointment => ({
                        id: appointment.id,
                        date: appointment.appointmentDate,
                        timeSlot: appointment.timeSlot,
                        doctorName: appointment.doctor?.name || 'Unknown Doctor',
                        procedure: appointment.doctor?.specialty || 'General Checkup',
                        totalPayment: appointment.doctor?.fee || 0,
                        status: appointment.status || 'Pending'
                    }))
                    : [];

                setAppointments(transformedAppointments);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load appointments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [patientId]);

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            setAppointments(prev =>
                prev.map(appointment =>
                    appointment.id === appointmentId
                        ? { ...appointment, status: newStatus }
                        : appointment
                )
            );
        } catch (err) {
            setError('Failed to update status. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP'
        }).format(amount || 0);
    };

    const getStatusButtonClass = (currentStatus, buttonStatus) => {
        const baseClass = `status-btn ${buttonStatus.toLowerCase()}`;
        return currentStatus === buttonStatus 
            ? `${baseClass} active` 
            : baseClass;
    };

    if (loading) {
        return (
            <div className='appointment-container'>
                <Patientoption />
                <div className='appointment-header'>
                    <div className='data2'>
                        <div className='title2'>
                            <p>Procedures</p>
                        </div>
                    </div>
                </div>
                <hr id="split" />
                <div className="loading">Loading Procedures...</div>
            </div>
        );
    }

    return (
        
        <div className='appointment-container'>

            <Patientoption />

            <div className='appointment-header'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Procesdures</p>
                    </div>
                </div>
            </div>
            <hr id="split" />
            
            <div className="appointments-table-container">
                {/* {error && <div className="error-message">{error}</div>} */}
                {appointments.length === 0 ? (
                    <div className="no-appointments-message">
                        <span className="error-icon">&#9888;</span>
                        <span>No completed appointment records yet.</span>
                    </div>
                ) : (
                    <table className='appointments-table'>
                        <thead>
                            <tr>
                                <th><FaCalendarAlt className="column-icon" /> Date & Time</th>
                                <th><FaUserMd className="column-icon" /> Doctor Name</th>
                                <th><FaTooth className="column-icon" /> Procedure</th>
                                <th><FaMoneyBillWave className="column-icon" /> Total Payment</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.id} className={`appointment-row ${appointment.status.toLowerCase()}`}>
                                    <td>
                                        {formatDate(appointment.date)}<br />
                                        <small>{appointment.timeSlot}</small>
                                    </td>
                                    <td>{appointment.doctorName}</td>
                                    <td>{appointment.procedure}</td>
                                    <td>{formatCurrency(appointment.totalPayment)}</td>
                                    <td>
                                        <div className="payment-status-buttons">
                                            <button
                                                className={getStatusButtonClass(appointment.status, 'Cancelled')}
                                                onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                                                title="Cancelled"
                                            >
                                                <FaTimes /> Cancel
                                            </button>
                                            <button
                                                className={getStatusButtonClass(appointment.status, 'Pending')}
                                                onClick={() => handleStatusChange(appointment.id, 'Pending')}
                                                title="Pending"
                                            >
                                                <FaClock /> Pending
                                            </button>
                                            <button
                                                className={getStatusButtonClass(appointment.status, 'Completed')}
                                                onClick={() => handleStatusChange(appointment.id, 'Completed')}
                                                title="Completed"
                                            >
                                                <FaThumbsUp /> Complete
                                            </button>
                                            <button
                                                className={getStatusButtonClass(appointment.status, 'Paid')}
                                                onClick={() => handleStatusChange(appointment.id, 'Paid')}
                                                title="Paid"
                                            >
                                                <FaCheck /> Paid
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Appointment;






// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import './Appointment.css';
// import { Patientoption } from '../patientData/patientoption';
// import { FaCalendarAlt, FaUserMd, FaTooth, FaMoneyBillWave, FaCheck, FaClock, FaTimes, FaThumbsUp } from 'react-icons/fa';

// const API_BASE_URL = 'http://localhost:5068';
// export const Appointment = () => {
//     const [appointments, setAppointments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const { id: patientId } = useParams();

//     useEffect(() => {
//         const fetchAppointments = async () => {
//             try {
//                 console.log('[DEBUG] Starting fetchAppointments');
//                 console.log('[DEBUG] Patient ID from params:', patientId);
                
//                 if (!patientId) {
//                     const errorMsg = 'Patient ID is missing';
//                     console.error('[ERROR]', errorMsg);
//                     throw new Error(errorMsg);
//                 }

//                 const endpoint = `${API_BASE_URL}/api/Appointments/patient/${patientId}`;
//                 console.log('[DEBUG] Fetching from endpoint:', endpoint);

//                 const response = await fetch(endpoint);
//                 console.log('[DEBUG] Raw response:', response);

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({}));
//                     const errorMsg = errorData.message || 
//                                     `Failed to load appointments: ${response.status} ${response.statusText}`;
//                     console.error('[ERROR]', errorMsg);
//                     throw new Error(errorMsg);
//                 }

//                 const data = await response.json();
//                 console.log('[DEBUG] Raw API response data:', data);

//                 if (!Array.isArray(data)) {
//                     const errorMsg = 'Expected array but got: ' + typeof data;
//                     console.error('[ERROR]', errorMsg, data);
//                     throw new Error(errorMsg);
//                 }

//                 console.log('[DEBUG] Mapping appointments data...');
//                 const transformedAppointments = data.map((appointment, index) => {
//                     const transformed = {
//                         id: appointment.id,
//                         date: appointment.appointmentDate,
//                         timeSlot: appointment.timeSlot,
//                         doctorName: appointment.doctor?.name || 'Unknown Doctor',
//                         procedure: appointment.doctor?.specialty || 'General Checkup',
//                         totalPayment: appointment.doctor?.fee || 0,
//                         status: appointment.status || 'Pending', // Use status from endpoint
//                         // Include raw data for debugging
//                         _raw: appointment
//                     };
//                     console.log(`[DEBUG] Appointment ${index} transformed:`, transformed);
//                     return transformed;
//                 });

//                 console.log('[DEBUG] All transformed appointments:', transformedAppointments);
//                 setAppointments(transformedAppointments);
//                 setError(null);
//             } catch (err) {
//                 console.error('[ERROR] Error fetching appointments:', err);
//                 setError(err.message || 'Failed to load appointments. Please try again later.');
//             } finally {
//                 console.log('[DEBUG] Fetch completed, setting loading to false');
//                 setLoading(false);
//             }
//         };

//         fetchAppointments();
//     }, [patientId]);

//     const handleStatusChange = async (appointmentId, newStatus) => {
//         try {
//             console.log('[DEBUG] Updating status for appointment:', appointmentId, 'to:', newStatus);
            
//             const response = await fetch(`${API_BASE_URL}/api/Appointments/${appointmentId}/status`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ status: newStatus }),
//             });

//             if (!response.ok) {
//                 const errorMsg = `Failed to update status: ${response.status} ${response.statusText}`;
//                 console.error('[ERROR]', errorMsg);
//                 throw new Error(errorMsg);
//             }

//             console.log('[DEBUG] Status updated successfully');
//             setAppointments(prev =>
//                 prev.map(appointment =>
//                     appointment.id === appointmentId
//                         ? { ...appointment, status: newStatus }
//                         : appointment
//                 )
//             );
//         } catch (err) {
//             console.error('[ERROR] Error updating status:', err);
//             setError('Failed to update status. Please try again.');
//         }
//     };

//     const formatDate = (dateString) => {
//         try {
//             const date = new Date(dateString);
//             console.log('[DEBUG] Formatting date:', dateString, '->', date);
//             return date.toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//             });
//         } catch (e) {
//             console.error('[ERROR] Error formatting date:', dateString, e);
//             return 'Invalid date';
//         }
//     };

//     const formatCurrency = (amount) => {
//         console.log('[DEBUG] Formatting currency:', amount);
//         return new Intl.NumberFormat('en-EG', {
//             style: 'currency',
//             currency: 'EGP'
//         }).format(amount || 0);
//     };

//     const getStatusButtonClass = (currentStatus, buttonStatus) => {
//         const baseClass = `status-btn ${buttonStatus.toLowerCase()}`;
//         return currentStatus === buttonStatus 
//             ? `${baseClass} active` 
//             : baseClass;
//     };

//     console.log('[DEBUG] Current component state:', {
//         loading,
//         error,
//         appointments,
//         patientId
//     });

//     if (loading) {
//         console.log('[DEBUG] Rendering loading state');
//         return <div className="loading">Loading appointments...</div>;
//     }
//     if (error) {
//         console.log('[DEBUG] Rendering error state:', error);
//         return <div className="error">{error}</div>;
//     }

//     console.log('[DEBUG] Rendering main component with appointments:', appointments);
//     return (
//         <div className='appointment-container'>
//             <Patientoption />
//             <div className='appointment-header'>
//                 <div className='data2'>
//                     <div className='title2'>
//                         <p>Appointments & Procedures</p>
//                     </div>
//                 </div>
//             </div>
//             <hr id="split" />
            
//             <div className="appointments-table-container">
//                 {appointments.length === 0 ? (
//                     <>
//                         <p className="no-appointments">There are no procedures scheduled</p>
//                         <div style={{ color: 'red', marginTop: '20px' }}>
//                             <strong>Debug Info:</strong>
//                             <div>Patient ID: {patientId}</div>
//                             <div>Appointments array length: {appointments.length}</div>
//                         </div>
//                     </>
//                 ) : (
//                     <>
//                         <div style={{ color: 'green', marginBottom: '10px' }}>
//                             <strong>Debug Info:</strong> Showing {appointments.length} appointments
//                         </div>
//                         <table className='appointments-table'>
//                             <thead>
//                                 <tr>
//                                     <th><FaCalendarAlt className="column-icon" /> Date & Time</th>
//                                     <th><FaUserMd className="column-icon" /> Doctor Name</th>
//                                     <th><FaTooth className="column-icon" /> Procedure</th>
//                                     <th><FaMoneyBillWave className="column-icon" /> Total Payment</th>
//                                     <th>Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {appointments.map((appointment) => (
//                                     <tr key={appointment.id} className={`appointment-row ${appointment.status.toLowerCase()}`}>
//                                         <td>
//                                             {formatDate(appointment.date)}<br />
//                                             <small>{appointment.timeSlot}</small>
//                                         </td>
//                                         <td>{appointment.doctorName}</td>
//                                         <td>{appointment.procedure}</td>
//                                         <td>{formatCurrency(appointment.totalPayment)}</td>
//                                         <td>
//                                             <div className="status-buttons-container">
//                                                 <button
//                                                     className={getStatusButtonClass(appointment.status, 'Cancelled')}
//                                                     onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
//                                                     title="Cancelled"
//                                                 >
//                                                     <FaTimes /> Cancel
//                                                 </button>
//                                                 <button
//                                                     className={getStatusButtonClass(appointment.status, 'Pending')}
//                                                     onClick={() => handleStatusChange(appointment.id, 'Pending')}
//                                                     title="Pending"
//                                                 >
//                                                     <FaClock /> Pending
//                                                 </button>
//                                                 <button
//                                                     className={getStatusButtonClass(appointment.status, 'Completed')}
//                                                     onClick={() => handleStatusChange(appointment.id, 'Completed')}
//                                                     title="Completed"
//                                                 >
//                                                     <FaThumbsUp /> Complete
//                                                 </button>
//                                                 <button
//                                                     className={getStatusButtonClass(appointment.status, 'Paid')}
//                                                     onClick={() => handleStatusChange(appointment.id, 'Paid')}
//                                                     title="Paid"
//                                                 >
//                                                     <FaCheck /> Paid
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Appointment;