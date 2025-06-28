import './Sidebar.css'
import {Link} from 'react-router-dom'
import React, { useState } from 'react'
import Dropdownmenu from './Dropdownmenu'
import money from '../../../image/budget.png' 
import home from "../../../image/building.png"
import Schdeule from '../../../image/schedule.png' 
import patient from '../../../image/user-account.png'
import Attendance from '../../../image/attendance.png'

export const Sidebar = () => {
    const [patientMenu, setPatientmenu] = useState(false);

    function click() {
        if (patientMenu === false)
            setPatientmenu(true);
        else
            setPatientmenu(false);
    }

    return (
        <div className='sidebar1'>
            <div className='side-menu1'>
                <ul>
                    <li><img src={home} alt="" /><Link to='/Doctor/Dashboard' className='link' style={{color:"#022253"}}><p>Home</p></Link></li>
                    <hr id='hr'/>
                    <li id= "patient-menu" onClick={click}>
                        <img id= "patient1" src={patient} alt="" /><p>Patients</p> 
                    </li>
                        <Dropdownmenu isVisible={patientMenu}/>
                    <hr id='hr'/>
                    <li><img src={Schdeule} alt="" /><Link to='/Doctor/Schdeule' className='link' style={{color:"#022253"}}><p>Schdeule</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={Attendance} alt="" /><Link to='/Doctor/Attendance' className='link' style={{color:"#022253"}}><p>Attendance</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={money} alt="" /><Link to='/Doctor/Financial' className='link' style={{color:"#022253"}}><p>Financial</p></Link></li>
                    <hr id='hr'/>
                </ul>
                
            </div>
        </div>
    )
}


export default Sidebar;