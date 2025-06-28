import React from 'react'
import { Link } from 'react-router-dom'


export const Dropdownmenu = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className='patient-menu'>
            <ul>
                
                <Link to='/Patient/Doctors' className='link' style={{color:"#022253"}}>
                    <li>Doctors List</li>
                </Link> 
            </ul>
        </div>
    );
}

export default Dropdownmenu;
