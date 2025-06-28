import React  from 'react'
import './sidbar.css'
import {Link} from 'react-router-dom'
import online from '../../../image/online.png'
import home from "../../../image/building.png"
import money from '../../../image/budget.png' 
import to_do from '../../../image/to-do-list.png'
import Attend from '../../../image/attendance.png'
import ortho from '../../../image/orthodontist.png'

export const Sidebar = () => {

    return (
        <div className='sidebar1'>
            <div className='side-menu2'>
                <ul>
                    <li><img src={home} alt="" /><Link to='/Manager/Dashboard' className='link' style={{color:"#022253"}}><p>Home</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={ortho} alt="" /><Link to='/Manager/StaffList' className='link' style={{color:"#022253"}}><p>Staff List</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={Attend} alt="" /><Link to='/Manager/Staff/Attendance' className='link' style={{color:"#022253"}}><p>Attendance</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={online} alt="" /><Link to='/Manager/StaffApproval' className='link' style={{color:"#022253"}}><p>Staff Approvals</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={to_do} alt="" /><Link to='/Manager/Doctor/Schedule' className='link' style={{color:"#022253"}}><p>Doctor Schdeule</p></Link></li>
                    <hr id='hr'/>
                    <li><img src={money} alt="" /><Link to='/Manager/Financial' className='link' style={{color:"#022253"}}><p>Finance</p></Link></li>
                    <hr id='hr'/>
                </ul>
                
            </div>
        </div>
    )
}


export default Sidebar;