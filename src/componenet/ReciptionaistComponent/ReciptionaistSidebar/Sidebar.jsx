import './Sidebar.css'
import {React, useState} from 'react'
import {Link} from 'react-router-dom'
import Dropdownmenu from './Dropdownmenu'
import money from '../../../image/budget.png' 
import home from "../../../image/building.png"
import online from "../../../image/online.png"
import dentist from "../../../image/orthodontist.png"
import attendance from '../../../image/attendance.png'

export const Sidebar = () => {
    const [patientMenu, setPatientMenu] = useState(false);
    
    function click() {
        setPatientMenu(!patientMenu);
    }

    return (
        <div className='sidebar1'>
            <div className='side-menu1'>
                <ul>
                    <li>
                        <img src={home} alt="" style={{width:"20px", marginLeft:"-3px"}}/>
                        <Link to='/Receptionist/Dashboard' className='link' style={{color:"#022253"}}>
                            <p>Dashboard</p>
                        </Link>
                    </li>
                    <hr id='hr'/>
                    <li onClick={click}>
                        <img src={dentist} alt="" />
                        <p>Patient</p>
                    </li>
                    <Dropdownmenu isVisible={patientMenu}/>
                    <hr id='hr'/>
                    <li>
                        <img src={online} alt="" style={{width:"20px", marginLeft:"-3px"}}/>
                        <Link to='/Receptionist/ShowAppointment' className='link' style={{color:"#022253"}}>
                            <p>Appointments</p>
                        </Link>
                    </li>
                    <hr id='hr'/>
                    <li>
                        <img src={attendance} alt="" />
                        <Link to='/Receptionist/Attendance' className='link' style={{color:"#022253"}}>
                            <p>Attendance</p>
                        </Link>
                    </li>
                    <hr id='hr'/>
                    <li>
                        <img src={money} alt="" />
                        <Link to='/Receptionist/Financial' className='link' style={{color:"#022253"}}>
                            <p>Financial</p>
                        </Link>
                    </li>
                    <hr id='hr'/>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar;