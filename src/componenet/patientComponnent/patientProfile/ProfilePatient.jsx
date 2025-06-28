import './ProfilePatient.css'
import user from "../../../image/user.png"
import { FaEnvelope } from "react-icons/fa";
import React, { useState, useEffect } from 'react'

const ProfilePatient = () => {
    const [userData, setUserData] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        // Replace this with real API call:
        // fetch('/api/patient-profile')
        //   .then(res => res.json())
        //   .then(data => setUserData(data))

        // Temporary initial state to avoid errors before data loads:
        setUserData({
            id: null,
            name: '',
            image: user,
            email: '',
            phoneNumber: '',
            gender: '',
            Age: '',
            pregrancyStatus: 'Not Pregnant',
            address: '',
            nationalId: '',
            bloodType: '',
            maritalStatus: '',
            insuranceNumber: '',
            allergies: '',
            chronicDiseases: '',
            dateOfBirth: '',
        });
    }, []);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setUserData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    if (!userData) return <div>Loading patient profile...</div>;

    return (
        <div className='patientProfile'>
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
                    <h3>{userData.name || 'Patient Name'}</h3>
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
                            <p><FaEnvelope /> NationalId</p>
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
                            <p>Age:</p>
                            {isEdit ? (
                                <input
                                    type='number'
                                    value={userData.Age}
                                    onChange={(e) => setUserData(prev => ({ ...prev, Age: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.Age}</p>
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
                            <p>Gender:</p>
                            <p style={{ textTransform: "capitalize" }}>{userData.gender}</p>
                        </div>

                        {userData.gender.toLowerCase() === "female" && (
                            <div>
                                <p>Pregnancy:</p>
                                {isEdit ? (
                                    <select
                                        value={userData.pregrancyStatus}
                                        onChange={(e) => setUserData(prev => ({ ...prev, pregrancyStatus: e.target.value }))}
                                        className='selection'
                                    >
                                        <option value="Pregnant">Pregnant</option>
                                        <option value="Not Pregnant">Not Pregnant</option>
                                    </select>
                                ) : (
                                    <p>{userData.pregrancyStatus}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <p>Marital Status:</p>
                            {isEdit ? (
                                <select
                                    value={userData.maritalStatus}
                                    onChange={e => setUserData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                                >
                                    <option>Single</option>
                                    <option>Married</option>
                                    <option>Divorced</option>
                                    <option>Widowed</option>
                                </select>
                            ) : (
                                <p>{userData.maritalStatus}</p>
                            )}
                        </div>

                        <div>
                            <p>Date of Birth:</p>
                            {isEdit ? (
                                <input
                                    type="date"
                                    value={userData.dateOfBirth}
                                    onChange={e => setUserData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.dateOfBirth}</p>
                            )}
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

                        <div>
                            <p>Governorate:</p>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={userData.governorate}
                                    onChange={e => setUserData(prev => ({ ...prev, governorate: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.governorate}</p>
                            )}
                        </div>

                        <div>
                            <p>Insurance No.:</p>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={userData.insuranceNumber}
                                    onChange={e => setUserData(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.insuranceNumber}</p>
                            )}
                        </div>

                        <div>
                            <p>Allergies:</p>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={userData.allergies}
                                    onChange={e => setUserData(prev => ({ ...prev, allergies: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.allergies}</p>
                            )}
                        </div>

                        <div>
                            <p style={{marginRight:"20px"}}>Chronic Diseases:</p>
                            {isEdit ? (
                                <input
                                    type="text"
                                    value={userData.chronicDiseases}
                                    onChange={e => setUserData(prev => ({ ...prev, chronicDiseases: e.target.value }))}
                                />
                            ) : (
                                <p>{userData.chronicDiseases}</p>
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

export default ProfilePatient;
