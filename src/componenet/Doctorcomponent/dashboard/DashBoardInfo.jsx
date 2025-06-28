import React, { useState, useEffect } from 'react';
import "./Dashboard.css";
import money from '../../../image/money.png';
import profile from '../../../image/user.png';
import cancel from '../../../image/cancel.png';
import correct from '../../../image/checked.png';
import patient from '../../../image/patient.png';
import appointment from '../../../image/appointment.png';
import list from '../../../image/to-do-list.png';
import Notification from '../../../components/Notification';

const API_BASE_URL = "http://localhost:5068/api/Dashboard";

export const DashBoardInfo = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        earnings: 0,
        appointmentsCount: 0,
        patientsCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const doctorId = localStorage.getItem('doctorId');
    const [earnings, setEarnings] = useState([]);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'info'
    });

    console.log("Doctor id => "+doctorId)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const [statsResponse, bookingsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/stats/${doctorId}`),
                    fetch(`${API_BASE_URL}/bookings/${doctorId}`)
                ]);
                
                if (!statsResponse.ok) throw new Error('Failed to load dashboard stats');
                if (!bookingsResponse.ok) throw new Error('Failed to load bookings');
                
                const statsData = await statsResponse.json();
                const bookingsData = await bookingsResponse.json();
                console.log("Bookings Data:", statsData);
                const transformedBookings = bookingsData.map(booking => ({
                    ...booking,
                    patientName: booking.patientName || `Patient ${booking.patientId}`,
                    time: booking.time ? booking.time.split('.')[0] : '00:00',
                    // Normalize status to lowercase for consistent comparison
                    status: booking.status ? booking.status.toLowerCase() : null
                }));
                setStats({
                    earnings: statsData.totalEarnings,
                    appointmentsCount: statsData.appointmentsCount,
                    patientsCount: statsData.patientsCount
                });
                
                setBookings(transformedBookings);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDashboardData();
    }, [doctorId]);

    useEffect(() => {
        const loginSuccess = localStorage.getItem('loginSuccess');
        if (loginSuccess) {
            try {
                const loginData = JSON.parse(loginSuccess);
                const roleDisplay = loginData.role.charAt(0).toUpperCase() + loginData.role.slice(1);
                const successMessage = `🎉 Welcome back, ${loginData.name}! Successfully logged in as ${roleDisplay}.`;
                
                setNotification({
                    isVisible: true,
                    message: successMessage,
                    type: 'success'
                });
                
                // Remove the login success data from localStorage
                localStorage.removeItem('loginSuccess');
                
                // Auto-hide after 8 seconds
                setTimeout(() => {
                    setNotification(prev => ({ ...prev, isVisible: false }));
                }, 8000);
            } catch (error) {
                console.error('Error parsing login success data:', error);
                localStorage.removeItem('loginSuccess');
            }
        }
    }, []);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!doctorId) {
                console.error('No doctorId found in localStorage');
                setIsLoading(true);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5068/api/Dashboard/GetDoctorsEarning/${doctorId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    const totalEarning = data[0].totalEarning;
                    console.log("Total Earning:", totalEarning);
                    setEarnings(totalEarning);
                } else {
                    setEarnings(0);
                    console.log("No earnings found.");
                }
            } catch (error) {
                console.error('Error fetching earnings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEarnings();
    }, [doctorId]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Send lowercase status to backend
            const response = await fetch(`${API_BASE_URL}/booking/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId: id,
                    status: newStatus.toLowerCase() // Ensure lowercase when sending to backend
                })
            });
            
            if (!response.ok) throw new Error('Failed to update booking status');
            
            // Update local state with lowercase status
            setBookings(prev => prev.map(booking =>
                booking.id === id ? { ...booking, status: newStatus.toLowerCase() } : booking
            ));
            
            // Update stats if payment was completed
            if (newStatus.toLowerCase() === "Paid") {
                const booking = bookings.find(b => b.id === id);
                if (booking && booking.isPaid) {
                    setStats(prev => ({
                        ...prev,
                        earnings: prev.earnings + booking.paymentAmount
                    }));
                }
            }
        } catch (err) {
            console.error("Error updating booking status:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return "12:00 AM";
        
        if (timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':');
            const time = new Date();
            time.setHours(parseInt(hours), parseInt(minutes), 0);
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        return timeString;
    };

    // Helper function to display status with proper capitalization
    const displayStatus = (status) => {
        if (!status) return null;
        
        const statusMap = {
            'pending': 'Pending',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'paid': 'Paid'
        };
        
        return statusMap[status.toLowerCase()] || status;
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    if (isLoading) {
        return <div className="dashboard-loading">Loading dashboard data...</div>;
    }

    if (error) {
        return <div className="dashboard-error">Error: {error}</div>;
    }

    return (
        <div className="dashboard1">
            <div className="data2">
                <div className='title2'><p>Dashboard</p></div>
                <hr id="split" />
            </div>

            <div className="details">
                <div className="up1">
                    <div className="docInfo">
                        <div className="Info1">
                            <img src={money} alt="money" style={{ width: "40px" }} />
                            <div>
                                <p>$ {earnings}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.416)" }}>Earnings</p>
                            </div>
                        </div>

                        <div className="Info1">
                            <img src={appointment} alt="appointments" style={{ width: "40px" }} />
                            <div>
                                <p>{stats.appointmentsCount}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.416)" }}>Appointments</p>
                            </div>
                        </div>

                        <div className="Info1">
                            <img src={patient} alt="patients" style={{ width: "40px" }} />
                            <div>
                                <p>{stats.patientsCount}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.416)" }}>Patients</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="down1">
                    <div className='title1' style={{ width: "100%" }}>
                        <div>
                            <img src={list} alt="list" style={{ width: "30px" }} />
                            <p>Latest Bookings</p>
                        </div>
                        <hr />
                    </div>
                    {bookings.map((booking) => (
                        <div key={booking.id} className='appointment1'>
                            <div className="description">
                                <img src={profile} alt="profile" style={{ width: "30px", height: "30px" }} />
                                <div>
                                    <p style={{ fontWeight: "600" }}>{booking.patientName}</p>
                                    <p>Booking on {formatDate(booking.date)}</p>
                                    <p>Time at {formatTime(booking.time)}</p>
                                    {(() => {
                                        const status = booking.status ? booking.status.toLowerCase() : '';
                                        const amount = booking.paymentAmount ? `: $${booking.paymentAmount}` : '';
                                        
                                        if (status === 'paid') {
                                            return (
                                                <p style={{ color: "green", fontSize: "14px", fontWeight: "bold" }}>
                                                    Paid{amount}
                                                </p>
                                            );
                                        } else if (status === 'completed' || status === 'confirmed') {
                                            return (
                                                <p style={{ color: "blue", fontSize: "14px", fontWeight: "bold" }}>
                                                    Completed
                                                </p>
                                            );
                                        } else if (status === 'pending') {
                                            return (
                                                <p style={{ color: "orange", fontSize: "14px", fontWeight: "bold" }}>
                                                    Pending
                                                </p>
                                            );
                                        } else if (status === 'cancelled') {
                                            return (
                                                <p style={{ color: "red", fontSize: "14px", fontWeight: "bold" }}>
                                                    Cancelled
                                                </p>
                                            );
                                        } else {
                                            return (
                                                <p style={{ color: "gray", fontSize: "14px", fontWeight: "bold" }}>
                                                    Unknown Status{amount}
                                                </p>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>

                            <div className="complete1">
                                {(!booking.status || booking.status.toLowerCase() === "pending") && (
                                    <>
                                        <button 
                                            onClick={() => handleStatusChange(booking.id, "Cancelled")}
                                            disabled={isLoading}
                                        >
                                            <img src={cancel} alt="Cancel" style={{ width: "30px" }} />
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(booking.id, "Completed")}
                                            disabled={isLoading}
                                        >
                                            <img src={correct} alt="Complete" style={{ width: "25px" }} />
                                        </button>
                                    </>
                                )}

                                {/* {booking.status === "completed" && (
                                    <p style={{ color: "green", fontWeight: "600", fontSize: "18px" }}>
                                        {displayStatus(booking.status)}
                                    </p>
                                )}

                                {booking.status === "cancelled" && (
                                    <p style={{ color: "red", fontWeight: "600", fontSize: "18px" }}>
                                        {displayStatus(booking.status)}
                                    </p>
                                )} */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {notification.isVisible && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                />
            )}
        </div>
    );
};

export default DashBoardInfo;