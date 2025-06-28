import "../Navbarr/Navbar.css";
import { Menu } from "../Navbarr/menu";
import React, { useState, useEffect } from 'react';
import logo from "../../../image/tooth.png";
import Profile from "../../../image/user.png";
import { useNavigate, useParams } from "react-router-dom";

export const Patientoption = () => {
    const { id } = useParams();
    const [patientMenu, setPatientmenu] = useState(false);
    const [patient, setPatient] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Fetch basic patient data
                const patientResponse = await fetch(`http://localhost:5068/api/Patients/${id}`);
                if (!patientResponse.ok) throw new Error('Failed to fetch patient data');
                const patientData = await patientResponse.json();
                setPatient(patientData);

                // Fetch dashboard data (counts for prescriptions, images, etc.)
                const dashboardResponse = await fetch(`http://localhost:5068/api/Patients/${id}/dashboard`);
                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    setDashboardData(dashboardData);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [id]);

    const togglePatientMenu = () => setPatientmenu(prev => !prev);

    if (loading) return <div className="loading">Loading patient data...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!patient) return <div className="error">Patient not found</div>;

    return (
        <nav className="nav1">
            <div className="logo-container">
                <img src={logo} alt="ToothTone Logo" />
                <h1>ToothTone</h1>
            </div>    

            <div className='patient-menu1'>
                <div className="nav1-menu">
                    <ul>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Receptionist/Patient/${id}/Book`)}
                        >
                            Booking
                        </li>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Receptionist/Patient/${id}/Patient Profile`)}
                        >
                            Profile
                        </li>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Receptionist/Patient/${id}/Patient Payment`)}
                        >
                            Payment {dashboardData?.pendingPayments > 0 && `(${dashboardData.pendingPayments})`}
                        </li>
                        {/* <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Receptionist/Patient/${id}/Documents`)}
                        >
                            Documents {dashboardData?.documentCount > 0 && `(${dashboardData.documentCount})`}
                        </li> */}
                    </ul>
                </div>
            </div>

            <div className="profile-container1">
                <img 
                    id="userPhoto1" 
                    src={Profile} 
                    alt="Profile" 
                    onClick={togglePatientMenu}
                    onKeyDown={(e) => e.key === 'Enter' && togglePatientMenu()}
                    tabIndex="0"
                />
                <Menu isVisible={patientMenu} />
                {patient && (
                    <div className="patient-info">
                        <span>{patient.firstName} {patient.lastName}</span>
                    </div>
                )}
            </div> 
        </nav>
    );
};

export default Patientoption;