import "../Navbarr/Navbar.css";
import { Menu } from "../Navbarr/menu";
import React, { useState, useEffect } from 'react';
import logo from "../../../image/tooth.png";
import Profile from "../../../image/user.png";
import { useNavigate, useParams } from "react-router-dom";

export const Patientoption = () => {
    const { id } = useParams();
    const [patientMenu, setPatientmenu] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch patient name
                const nameResponse = await fetch(`http://localhost:5068/api/Patients/${id}/name`);
                if (nameResponse.ok) {
                    const nameData = await nameResponse.json();
                    setPatientName(nameData.name);
                }

                // Fetch patient summary
                const summaryResponse = await fetch(`http://localhost:5068/api/patient-options/${id}/summary`);
                if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json();
                    setSummary(summaryData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <nav className="nav1">
                <div>Loading patient data...</div>
            </nav>
        );
    }

    return (
        <nav className="nav1">
            <div>
                <img src={logo} alt="" />
                <h1>ToothTone</h1>
            </div>    

            <div className='patient-menu1'>
                <div className="nav1-menu">
                    <ul>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Doctor/Patient/${id}/Prescription`)}
                        >
                            Prescription {summary?.PrescriptionCount > 0 && `(${summary.PrescriptionCount})`}
                        </li>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Doctor/Patient/${id}/PerioChart`)}
                        >
                            Periodontal Chart {summary?.PerioChartCount > 0 && `(${summary.PerioChartCount})`}
                        </li>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Doctor/Patient/${id}/Image`)}
                        >
                            Images {summary?.ImageCount > 0 && `(${summary.ImageCount})`}
                        </li>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Doctor/Patient/${id}/Docs`)}
                        >
                            Docs {summary?.DocumentCount > 0 && `(${summary.DocumentCount})`}
                        </li>
                        <li 
                            className="patientoption" 
                            onClick={() => navigate(`/Doctor/Patient/${id}/Upload`)}
                        >
                            Upload
                        </li>
                    </ul>
                </div>
            </div>

            <div className="profile-container1">
                <img 
                    id="userPhoto1" 
                    src={Profile} 
                    alt="Profile" 
                    onClick={() => setPatientmenu(prev => !prev)}
                />
                <Menu isVisible={patientMenu} />
            </div> 
        </nav>
    );
};

export default Patientoption;