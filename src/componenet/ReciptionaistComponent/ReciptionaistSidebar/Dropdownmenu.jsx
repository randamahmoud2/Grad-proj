import React from 'react'
import { Link } from 'react-router-dom'


export const Dropdownmenu = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className='patient-menu'>
            <ul>
                <Link to='/Receptionist/ADDPatient' className='link' style={{color:"#022253"}}>
                    <li style={{color:"#022253", marginLeft:"-1px"}}>New Patient</li>
                </Link> 
                <hr style={{ border: "none", height: "1px", background: "#02102409", width: "100%" }} />
                <Link to='/Receptionist/PatientList' className='link' style={{color:"#022253"}}>
                    <li style={{color:"#022253", marginLeft:"-1px"}}>Patient List</li>
                </Link>
                <hr style={{ border: "none", height: "1px", background: "#02102409", width: "100%" }} />
            </ul>
        </div>
    );
}

export default Dropdownmenu;
