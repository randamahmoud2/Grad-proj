import './DoctorProfile.css'
import React, { useState, useEffect } from 'react'
import user from "../../../image/user.png"
import { FaUser, FaEnvelope, FaPhone, FaVenusMars, FaCalendarAlt, FaDollarSign, FaBriefcase, FaInfoCircle } from 'react-icons/fa'

export const Profile = () => {
    const [userData, setUserData] = useState(null)
    const [isEdit, setIsEdit] = useState(false)

    useEffect(() => {
        // هنا تقدر تحط fetch API لجلب البيانات من السيرفر
        // مثال وهمي:
        // fetch('/api/doctor-profile')
        //   .then(res => res.json())
        //   .then(data => setUserData(data))

        // مؤقتًا نهيئ هيكل فارغ عشان ما يطلعش خطأ قبل البيانات الحقيقية
        setUserData({
            id: null,
            image: user,
            name: '',
            email: '',
            phoneNumber: '',
            gender: '',
            Dateofbirth: '',
            NationalID: '',
            fees: '',
            Experience: '',
            AboutMe: ''
        })
    }, [])

    const handleImageChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const imageUrl = URL.createObjectURL(file)
            setUserData(prev => ({ ...prev, image: imageUrl }))
        }
    }

    if (!userData) return <div>Loading profile...</div>

    return (
        <div className='doctorProfile'>
            <div className='profile'>
                <div className='left1'>
                    <div className='profileImage'>
                        <img src={userData.image || user} alt="Profile" />
                        <button className='addPhoto'>
                            <label htmlFor="fileInput">Change Profile Picture</label>
                        </button>
                        <input type="file" id="fileInput" className="file-upload" accept="image/*" onChange={handleImageChange} />
                    </div>
                </div>
                <div className='right1'>
                    <h3>{userData.name || 'Doctor Name'}</h3>
                    <div className='generalInfo'>
                        <div>
                            <p><FaEnvelope /> Email</p>
                            {isEdit ? (
                                <input type='email' value={userData.email} onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))} />
                            ) : (
                                <p>{userData.email}</p>
                            )}
                        </div>

                        <div>
                            <p><FaEnvelope /> NationalId</p>
                            {isEdit ? (
                                <input type='text' value={userData.NationalID} onChange={(e) => setUserData(prev => ({ ...prev, NationalID: e.target.value }))} />
                            ) : (
                                <p>{userData.NationalID}</p>
                            )}
                        </div>

                        <div>
                            <p><FaCalendarAlt /> DOB</p>
                            {isEdit ? (
                                <input type='date' value={userData.Dateofbirth} onChange={(e) => setUserData(prev => ({ ...prev, Dateofbirth: e.target.value }))} />
                            ) : (
                                <p>{userData.Dateofbirth}</p>
                            )}
                        </div>

                        <div>
                            <p><FaPhone /> Phone</p>
                            {isEdit ? (
                                <input type='tel' value={userData.phoneNumber} onChange={(e) => setUserData(prev => ({ ...prev, phoneNumber: e.target.value }))} />
                            ) : (
                                <p>{userData.phoneNumber}</p>
                            )}
                        </div>

                        <div>
                            <p><FaVenusMars /> Gender</p>
                            <p style={{ textTransform: "capitalize" }}>{userData.gender}</p>
                        </div>

                        <div>
                            <p><FaDollarSign /> Fees</p>
                            {isEdit ? (
                                <input type='text' value={userData.fees} onChange={(e) => setUserData(prev => ({ ...prev, fees: e.target.value }))} />
                            ) : (
                                <p>{userData.fees}</p>
                            )}
                        </div>

                        <div>
                            <p><FaBriefcase /> Experience</p>
                            {isEdit ? (
                                <input type='text' value={userData.Experience} onChange={(e) => setUserData(prev => ({ ...prev, Experience: e.target.value }))} />
                            ) : (
                                <p>{userData.Experience}</p>
                            )}
                        </div>

                        <div className="full-width">
                            <p><FaInfoCircle /> About</p>
                            {isEdit ? (
                                <textarea
                                    className="input"
                                    value={userData.AboutMe}
                                    onChange={(e) => setUserData(prev => ({ ...prev, AboutMe: e.target.value }))}
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <textarea
                                    className="input"
                                    readOnly
                                    value={userData.AboutMe}
                                />
                            )}
                        </div>
                    </div>

                    <div className='buttons'>
                        {isEdit ? (
                            <button className='save' onClick={() => setIsEdit(false)}>Save Changes</button>
                        ) : (
                            <button className='edit' onClick={() => setIsEdit(true)}>Edit Profile</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
