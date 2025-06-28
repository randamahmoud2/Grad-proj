import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Notification from '../../../components/Notification';

import money from "../../../image/money2.png";
import profile from "../../../image/user.png";
import cancel from "../../../image/cancel.png";
import correct from "../../../image/checked.png";
import patient from "../../../image/patient2.png";
import list from "../../../image/to-do-list.png";
import appointment from "../../../image/Schedule2.png";

export const DashBoardInfo = () => {
    const [bookings, setBookings] = useState([]);
    const [totalFees, setTotalFees] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const doctorId = localStorage.getItem('doctorId');
    const [earnings, setEarnings] = useState([]);
    
    // Notification state for login success
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'info'
    });

    // Check for login success on component mount
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

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    useEffect(() => {
        const fetchBookings = async () => {
           try {
    const response = await fetch("http://localhost:5068/api/Bookings");
    if (!response.ok) {
        throw new Error('Failed to fetch bookings');
    }
    const data = await response.json();
    
    setBookings(data);
    const earnings = data
        .filter(b => b.status === "Paid")
        .reduce((acc, cur) => acc + (cur.doctor?.fee || 0), 0);
        setTotalFees(earnings);
    
} catch (err) {
    setError(err.message);
    console.error("Error fetching bookings:", err);
} finally {
    setLoading(false);
}
        };

        fetchBookings();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5068/api/Bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Failed to update booking status');
            }

            setBookings(prev =>
                prev.map(b =>
                    b.id === id ? { ...b, status } : b
                )
            );

            if (status === "paid") {
                const fee = bookings.find(b => b.id === id)?.fee || 0;
                
                setTotalFees(prev => prev + fee);
            }
        } catch (err) {
            setError(err.message);
            console.error("Error updating booking status:", err);
        }
    };

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!doctorId) {
        console.error('No doctorId found in localStorage');
                setLoading(true);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5068/api/Dashboard/GetAdminEarning/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
                const data = await response.json();
                console.log(data)
                
        // Get the first object
        const firstItem = data[0];

        // Extract totalEarningsFees
        const totalEarnings = firstItem.totalEarningsFees;

        console.log(totalEarnings); // Output: 50
        if (totalEarnings) {
          setEarnings(totalEarnings);
        } else {
          console.warn('No earnings found for this doctor.');
          setEarnings(0);
        }
       
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
                setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

    if (loading) return <div className="loading">Loading dashboard data...</div>;
    if (error) return <div className="error">{error}</div>;


    return (
        <div className="dashboard1">
            {/* Notification Component */}
            {notification.isVisible && (
                <Notification
                    isVisible={notification.isVisible}
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                    autoClose={true}
                    duration={8000}
                />
            )}
            
            <div className="data2">
                <div className="title2"><p>Dashboard</p></div>
            </div>
            <hr id="split" />

            <div className="details">
                <div className="up1">
                    <div className="docInfo">
                        <div className="Info2">
                            <img src={money} alt="" style={{ width: "30px" }} />
                            <div>
                                <p>$ {earnings}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.416)" }}>Earnings</p>
                            </div>
                        </div>
                        <div className="Info2">
                            <img src={appointment} alt="" style={{ width: "30px" }} />
                            <div>
                                <p>{bookings.length}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.416)" }}>Appointments</p>
                            </div>
                        </div>
                        <div className="Info2">
                            <img src={patient} alt="" style={{ width: "30px" }} />
                            <div>
                                <p>{[...new Set(bookings.map(b => b.patientId || b.patient))].length}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.416)" }}>Patients</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="down1">
                    <div className="title1" style={{ width: "100%" }}>
                        <div>
                            <img src={list} alt="" style={{ width: "30px" }} />
                            <p>Latest Bookings</p>
                        </div>
                        <hr />
                    </div>

                    {bookings.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '16px', fontWeight: '600', color: 'gray', marginTop: '20px' }}>
                            There Are No Appointments
                        </p>
                    ) : (
                        bookings.slice(0, 5).map((booking) => (
                            <div className="signupEntry" key={booking.id}>
                                <div className="userInfo">
                                    <img src={profile} alt="" style={{ width: "40px", height: "40px" }} />
                                    <div>
                                        <p className="Names">
                                           {booking.doctorName || "Doctor"} | {booking.patientName|| "Patient"} 
                                        </p>
                                      {console.log(bookings)}
                                        <p className="datefee">Booking on {new Date(booking.bookingDate).toLocaleDateString()}</p>

                                        <p className="datefee">Fees: ${booking.amount?.toFixed(2) || "0.00"}</p>
                                    </div>
                                </div>
                                <div className="complete1">
                                    {(!booking.status || booking.status === "pending") && (
                                        <>
                                            <button onClick={() => handleStatusChange(booking.id, "cancelled")}>
                                                <img src={cancel} alt="Cancel" style={{ width: "30px" }} />
                                            </button>
                                            <button onClick={() => handleStatusChange(booking.id, "paid")}>
                                                <img src={correct} alt="Complete" style={{ width: "25px" }} />
                                            </button>
                                        </>
                                    )}
                                    {booking.status === "paid" && (
                                        <p style={{ color: "green", fontWeight: "600", fontSize: "10px" }}>Paid</p>
                                    )}
                                    {booking.status === "cancelled" && (
                                        <p style={{ color: "red", fontWeight: "600", fontSize: "10px" }}>Cancelled</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashBoardInfo;