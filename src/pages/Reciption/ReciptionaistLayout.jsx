import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../componenet/ReciptionaistComponent/Navbarr/Navbar'
import Sidebar from '../../componenet/ReciptionaistComponent/ReciptionaistSidebar/Sidebar'


const ReceptionistLayout = () => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default ReceptionistLayout