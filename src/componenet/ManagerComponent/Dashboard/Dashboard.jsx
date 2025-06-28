import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import worker from '../../../image/skills.png';
import patient from '../../../image/patient.png';
import list from "../../../image/to-do-list.png";
import group from '../../../image/group-chat.png';
import appointment from '../../../image/schedule.png';

export const Dashboard = () => {
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [totalStaff, setTotalStaff] = useState({ total: 0, doctors: 0, receptionists: 0 });
    const [totalPatients, setTotalPatients] = useState(0);
    const [todayAppointments, setTodayAppointments] = useState(0);
    const [recentSignUps, setRecentSignUps] = useState([]);
    const [loading, setLoading] = useState({
        pendingApprovals: true,
        totalStaff: true,
        totalPatients: true,
        todayAppointments: true,
        recentSignUps: true
    });

    // Fetch Pending Approvals
    useEffect(() => {
        const fetchPendingApprovals = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Manager/pending-registrations');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Pending registrations:', data);
                setPendingApprovals(data.count);
                setLoading(prev => ({ ...prev, pendingApprovals: false }));
            } catch (error) {
                console.error('Error fetching pending approvals:', error);
                setPendingApprovals(0);
                setLoading(prev => ({ ...prev, pendingApprovals: false }));
            }
        };
        fetchPendingApprovals();
    }, []);

    // Fetch Total Staff
    useEffect(() => {
        const fetchTotalStaff = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Staff/count');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Total staff:', data);
                setTotalStaff({
                    total: data.total,
                    doctors: data.doctors,
                    receptionists: data.receptionists
                });
                setLoading(prev => ({ ...prev, totalStaff: false }));
            } catch (error) {
                console.error('Error fetching total staff:', error);
                setTotalStaff({ total: 0, doctors: 0, receptionists: 0 });
                setLoading(prev => ({ ...prev, totalStaff: false }));
            }
        };
        fetchTotalStaff();
    }, []);

    // Fetch Total Patients
    useEffect(() => {
        const fetchTotalPatients = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Manager/patients/count');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Total patients:', data);
                setTotalPatients(data.count);
                setLoading(prev => ({ ...prev, totalPatients: false }));
            } catch (error) {
                console.error('Error fetching total patients:', error);
                setTotalPatients(0);
                setLoading(prev => ({ ...prev, totalPatients: false }));
            }
        };
        fetchTotalPatients();
    }, []);

    // Fetch Today's Appointments
    useEffect(() => {
        const fetchTodayAppointments = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Manager/appointments/today');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Today appointments:', data);
                setTodayAppointments(data.count);
                setLoading(prev => ({ ...prev, todayAppointments: false }));
            } catch (error) {
                console.error('Error fetching today appointments:', error);
                setTodayAppointments(0);
                setLoading(prev => ({ ...prev, todayAppointments: false }));
            }
        };
        fetchTodayAppointments();
    }, []);

    // Fetch Recent Sign-ups
    useEffect(() => {
        const fetchRecentSignUps = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Manager/recent-registrations');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Recent registrations:', data);
                const signUpsWithTimestamps = data
                    .filter(user => !['manager', 'account_manager'].includes(user.role.toLowerCase()))
                    .map((user, index) => ({
                        name: user.name,
                        role: user.role,
                        timestamp: new Date(Date.now() - (index + 1) * 10 * 60 * 1000)
                    }));
                setRecentSignUps(signUpsWithTimestamps);
                setLoading(prev => ({ ...prev, recentSignUps: false }));
            } catch (error) {
                console.error('Error fetching recent sign-ups:', error);
                setRecentSignUps([]);
                setLoading(prev => ({ ...prev, recentSignUps: false }));
            }
        };
        fetchRecentSignUps();
    }, []);

    // Function to calculate time ago
    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const diffMs = now - new Date(timestamp);
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);

        if (diffMinutes < 1) return "Just now";
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    };

    return (
        <div className="dashboard">
            <div className="data2">
                <div className='title2'>
                    <p>Dashboard</p>
                </div>
                <hr id="split" />
            </div>

            <div className="details">
                <div className="up2">
                    <div className="docInfo">
                        <div className="Info1">
                            <img src={worker} alt="" style={{ width: "40px", height: "40px" }} />
                            <div>
                                <p>{loading.pendingApprovals ? 'Loading...' : pendingApprovals}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.6)" }}>Pending Approvals</p>
                            </div>
                        </div>
                        <div className="Info1">
                            <img src={group} alt="" style={{ width: "50px", marginTop: "-8px" }} />
                            <div>
                                <p>{loading.totalStaff ? 'Loading...' : totalStaff.total}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.6)" }}>Total Staff</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.5)", fontSize: "13px" }}>
                                    {loading.totalStaff ? '' : `${totalStaff.doctors} Doctors, ${totalStaff.receptionists} Receptionists`}
                                </p>
                            </div>
                        </div>
                        <div className="Info1">
                            <img src={patient} alt="" style={{ width: "50px" }} />
                            <div>
                                <p>{loading.totalPatients ? 'Loading...' : totalPatients}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.6)" }}>Total Patients</p>
                            </div>
                        </div>
                        <div className="Info1">
                            <img src={appointment} alt="" style={{ width: "50px" }} />
                            <div>
                                <p>{loading.todayAppointments ? 'Loading...' : todayAppointments}</p>
                                <p style={{ color: "rgba(3, 3, 76, 0.6)" }}>Today's Appointments</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="down2">
                    <div className="recentSignUps">
                        <div className="header">
                            <h3>Recent Sign-ups</h3>
                            <button className="viewAll">View All</button>
                        </div>
                        {loading.recentSignUps ? (
                            <p style={{color:"rgba(55, 55, 55, 0.57)", fontWeight:"600", fontSize:"18px"}}>Loading...</p>
                        ) : recentSignUps.length > 0 ? (
                            recentSignUps.map((person, index) => (
                                <div key={index} className="signupEntry">
                                    <div className="userInfo">
                                        <div className="avatar">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div className="details1">
                                            <span className="name">{person.name}</span>
                                            <span className="role">
                                                {person.role.toLowerCase() === "doctor"
                                                    ? "Signed up as Doctor"
                                                    : person.role.toLowerCase() === "receptionist"
                                                    ? "Signed up as Receptionist"
                                                    : "Registered as Patient"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="date">{getTimeAgo(person.timestamp)}</div>
                                </div>
                            ))
                        ) : (
                            <p style={{color:"rgba(55, 55, 55, 0.57)", fontWeight:"600", fontSize:"18px"}}>No recent sign-ups.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;