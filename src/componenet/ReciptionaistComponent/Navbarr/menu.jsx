import React from 'react'
import logout_img from "../../../image/logout.png";
import Profile from "../../../image/user.png"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const Menu = ({ isVisible }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    if (isVisible) {
        return (
            <div className="dropdown-menu1" id="dropdownMenu">
                <div>
                    <img id="Photo" src={Profile} alt="Profile" />
                    <Link to='/Receptionist/Profile' className='link'><span>{localStorage.getItem('name')}</span></Link>
                </div>
                <hr />
                <div className="exit" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <img id="logout" src={logout_img} alt="" />
                    <span>Logout</span>
                </div>
            </div>
        );
    } else {
        return null;
    }
}

export default Menu;