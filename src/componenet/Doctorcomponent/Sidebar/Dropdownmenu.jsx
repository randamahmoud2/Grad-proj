import React from 'react'
import { Link } from 'react-router-dom'


export const Dropdownmenu = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className='patient-menu'>
            <ul>
                <Link to='/Doctor/Patient' className='link'>
                    <li>Patients List</li>
                </Link> 
                
                <hr style={{ border: "none", height: "1px", background: "#02102409", width: "100%" }} />
            </ul>
        </div>
    );
}

export default Dropdownmenu;
