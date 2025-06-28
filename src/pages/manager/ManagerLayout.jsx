import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../componenet/ManagerComponent/Navbar/Navbar'
import Sidebar from '../../componenet/ManagerComponent/Sidebar/Sidebar.jsx'

const ManagerLayout = () => {
    return (
        <div className="manager-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <div className="content">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default ManagerLayout;