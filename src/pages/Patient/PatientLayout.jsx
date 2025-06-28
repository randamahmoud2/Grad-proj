import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../componenet/patientComponnent/PatientLayout/Sidebar';
import Navbar from '../../componenet/patientComponnent/Navbarr/Navbar';


const PatientLayout = () => {
    const { logout } = useAuth();

    return (
        <div className="patient-layout">
            <Sidebar onLogout={logout} />
            <div className="patient-main-content">
                <Navbar onLogout={logout} />
                <main className="patient-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PatientLayout;