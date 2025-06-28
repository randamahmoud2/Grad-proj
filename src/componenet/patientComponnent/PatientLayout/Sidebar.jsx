import './Sidebar.css'
import {React, useState} from 'react'
import {Link} from 'react-router-dom'
import Dropdownmenu from './Dropdownmenu'
import home from "../../../image/building.png"
import online from "../../../image/online.png"
import booking from "../../../image/email1.png"
import finance from "../../../image/budget.png"
import dentist from "../../../image/orthodontist.png"


export const Sidebar = () => {

    const [doctorMenu, setDoctormenu] = useState(false);
    function click() {
        if (doctorMenu === false)
            setDoctormenu(true);
        else
            setDoctormenu(false);
    }

    return (
        <div className='sidebar1'>
            <div className='side-menu1'>
                <ul>
                    <li><img src={home} alt="" /><Link to='/Patient/Dashboard' className='link' style={{color:"#022253"}}><p>Dasboard</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={booking} alt="" /><Link to='/Patient/AllDoctors' className='link' style={{color:"#022253"}}><p>Booking</p></Link></li>
                    <hr id='hr'/>
                    <li onClick={click}><img src={dentist} alt="" /><p>Doctors</p></li>
                        <Dropdownmenu isVisible={doctorMenu}/>
                    <hr id='hr'/>
                    <li><img src={online} alt="" /><Link to='/Patient/ShowAppointment' className='link' style={{color:"#022253"}}><p>Appointments</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={finance} alt="" /><Link to='/Patient/Finance' className='link' style={{color:"#022253"}}><p>Financial</p></Link></li>
                    <hr id='hr'/>
                </ul>
                
            </div>
        </div>
    )
}


export default Sidebar;