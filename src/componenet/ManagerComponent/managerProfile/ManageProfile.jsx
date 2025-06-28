import React, { useState, useEffect } from 'react';
import './ManageProfile.css';
import user from "../../../image/user.png";
import { FaEnvelope } from "react-icons/fa";

const ManageProfile = () => {
    const [userData, setUserData] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        // Replace this with real API call:
        // fetch('/api/manager-profile')
        //   .then(res => res.json())
        //   .then(data => setUserData(data))

        // Temporary initial state to avoid errors before data loads:
        setUserData({
            id: null,
            name: '',
            image: user,
            email: '',
            phoneNumber: '',
            position: 'Clinic Manager',
            department: 'Management',
            nationalId: '',
            address: ''
        });
    }, []);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUserData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    if (!userData) return <div>Loading manager profile...</div>;

    return (
        <div className='managerProfile'>
            <div className='profile'>
                <div className='left1'>
                    <div className='profileImage'>
                        <img src={userData.image || user} alt="Profile" />
                        <button className='addPhoto'>
                            <label htmlFor="fileInput">Choose Profile Picture</label>
                        </button>
                        <input type="file" id="fileInput" className="file-upload" accept="image/*" onChange={handleImageChange} />
                    </div>
                </div>
                <div className='right1'>
                    <h3>{userData.name || 'Manager Name'}</h3>
                    <hr id='split' />
                    <div className='generalInfo'>
                        <div>
                            <p>Email:</p>
                            {isEdit ? (
                                <input
                                    type='email'
                                    value={userData.email}
                                    onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.email}</p>
                            )}
                        </div>

                        <div>
                            <p><FaEnvelope /> National ID</p>
                            {isEdit ? (
                                <input
                                    type='text'
                                    value={userData.nationalId}
                                    onChange={(e) => setUserData(prev => ({ ...prev, nationalId: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.nationalId}</p>
                            )}
                        </div>

                        <div>
                            <p>Phone:</p>
                            {isEdit ? (
                                <input
                                    type='text'
                                    value={userData.phoneNumber}
                                    onChange={(e) => setUserData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.phoneNumber}</p>
                            )}
                        </div>

                        <div>
                            <p>Position:</p>
                            <p>{userData.position}</p>
                        </div>

                        <div>
                            <p>Department:</p>
                            <p>{userData.department}</p>
                        </div>

                        <div>
                            <p>Address:</p>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={userData.address}
                                    onChange={e => setUserData(prev => ({ ...prev, address: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.address}</p>
                            )}
                        </div>
                    </div>

                    <div className='buttons'>
                        {isEdit ? (
                            <button className='save' style={{ padding: "0 15px", height: "35px" }} onClick={() => setIsEdit(false)}>Save Information</button>
                        ) : (
                            <button className='edit' style={{ padding: "0 15px", width: "100px", height: "35px" }} onClick={() => setIsEdit(true)}>Edit</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageProfile;
