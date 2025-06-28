import { Menu } from "./menu";
import React, {useState} from 'react'
import logo from "../../../image/tooth.png"
import Profile from "../../../image/user.png"
import '../../Doctorcomponent/Navbarr/Navbar.css'

export const Navbar = () => {
    const [patientMenu, setPatientmenu] = useState(false);

        function click() {
            if (patientMenu === false)
                setPatientmenu(true);
            else
                setPatientmenu(false);
        }

        function disappear() {
            if (patientMenu === true)
                setPatientmenu(false);
        }

            return (
                <nav className="nav1" onClick={disappear}>
                    <div>
                        <img src={logo} alt="" />
                        <h1>ToothTone</h1>
                    </div>    
                    <div className="profile-container">
                        <img id="userPhoto1" src={Profile} alt="Profile" onClick={click}/>
                        <Menu isVisible ={patientMenu}/>
                    </div> 
                </nav>
            )
}

export default Navbar;