import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Patientoption } from './patientoption';
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaIdCard, FaNotesMedical, FaTooth } from 'react-icons/fa';
import './ViewPatientData.css';

const ViewPatientData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState({
        personalInfo: {
            name: "",
            age: "",
            gender: "",
            id: "",
            birthDate: ""
        },
        contactInfo: {
            phone: "",
            email: "",
            address: ""
        },
        medicalHistory: {
            bloodType: "",
            allergies: [],
            chronicConditions: [],
            medications: []
        },
        dentalHistory: {
            lastVisit: "",
            nextAppointment: "",
            procedures: []
        }
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Fetch basic patient data
                const patientResponse = await fetch(`http://localhost:5068/api/Patients/${id}`);
                if (!patientResponse.ok) throw new Error('Failed to fetch patient data');
                const patientData = await patientResponse.json();

                // Fetch name separately if needed
                const nameResponse = await fetch(`http://localhost:5068/api/Patients/${id}/name`);
                const nameData = nameResponse.ok ? await nameResponse.json() : { name: '' };

                // Fetch dashboard data
                const dashboardResponse = await fetch(`http://localhost:5068/api/Patients/${id}/dashboard`);
                const dashboardData = dashboardResponse.ok ? await dashboardResponse.json() : {};

                // Fetch periocharts data
                const perioResponse = await fetch(`http://localhost:5068/api/Patients/${id}/periocharts`);
                const perioData = perioResponse.ok ? await perioResponse.json() : [];

                // Fetch images data
                const imagesResponse = await fetch(`http://localhost:5068/api/Patients/${id}/images`);
                const imagesData = imagesResponse.ok ? await imagesResponse.json() : [];

                // Fetch documents data
                const docsResponse = await fetch(`http://localhost:5068/api/Patients/${id}/documents`);
                const docsData = docsResponse.ok ? await docsResponse.json() : [];

                setPatientData({
                    personalInfo: {
                        name: nameData.name || patientData.name || "",
                        age: patientData.age || "",
                        gender: patientData.gender || "",
                        id: patientData.id || "",
                        birthDate: patientData.birthDate || patientData.DOB || ""
                    },
                    contactInfo: {
                        phone: patientData.phoneNumber || "",
                        email: patientData.email || "",
                        address: patientData.address || ""
                    },
                    medicalHistory: {
                        bloodType: patientData.bloodType || "",
                        allergies: patientData.allergies ? patientData.allergies.split(',').map(a => a.trim()) : [],
                        chronicConditions: patientData.chronicConditions ? 
                            patientData.chronicConditions.split(',').map(d => d.trim()) : [],
                        medications: patientData.medications || []
                    },
                    dentalHistory: {
                        lastVisit: dashboardData.lastVisit || "",
                        nextAppointment: dashboardData.nextAppointment || "",
                        procedures: dashboardData.procedures || [],
                        perioCharts: perioData,
                        images: imagesData,
                        documents: docsData
                    }
                });

            } catch (err) {
                setError('Failed to load patient data. Please try again later.');
                console.error('Error fetching patient data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [id]);

    if (loading) return <div className="loading">Loading patient data...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <Patientoption/>
            <div className='patientdata1'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Patient Profile</p>
                    </div>
                </div>
                <hr id="split"/>

                <div className="patient-container">
                    {/* Personal Information Section */}
                    <div className="info-section personal-info">
                        <div className="section-header">
                            <FaUser className="section-icon" />
                            <h3>Personal Information</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Full Name</span>
                                <span className="value">{patientData.personalInfo.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Age</span>
                                <span className="value">{patientData.personalInfo.age}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Gender</span>
                                <span className="value">{patientData.personalInfo.gender}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">ID Number</span>
                                <span className="value">{patientData.personalInfo.id}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Birth Date</span>
                                <span className="value">
                                    {patientData.personalInfo.birthDate ? 
                                        new Date(patientData.personalInfo.birthDate).toLocaleDateString() : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="info-section contact-info">
                        <div className="section-header">
                            <FaPhone className="section-icon" />
                            <h3>Contact Information</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Phone</span>
                                <span className="value">{patientData.contactInfo.phone}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Email</span>
                                <span className="value">{patientData.contactInfo.email}</span>
                            </div>
                            <div className="info-item full-width">
                                <span className="label">Address</span>
                                <span className="value">{patientData.contactInfo.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Medical History Section */}
                    <div className="info-section medical-history">
                        <div className="section-header">
                            <FaNotesMedical className="section-icon" />
                            <h3>Medical History</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Blood Type</span>
                                <span className="value">{patientData.medicalHistory.bloodType}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Allergies</span>
                                <span className="value">
                                    {patientData.medicalHistory.allergies.length > 0 ? 
                                        patientData.medicalHistory.allergies.join(", ") : "None"}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Chronic Conditions</span>
                                <span className="value">
                                    {patientData.medicalHistory.chronicConditions.length > 0 ? 
                                        patientData.medicalHistory.chronicConditions.join(", ") : "None"}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Current Medications</span>
                                <span className="value">
                                    {patientData.medicalHistory.medications.length > 0 ? 
                                        patientData.medicalHistory.medications.join(", ") : "None"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dental History Section */}
                    <div className="info-section dental-history">
                        <div className="section-header">
                            <FaTooth className="section-icon" />
                            <h3>Dental History</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Last Visit</span>
                                <span className="value">
                                    {patientData.dentalHistory.lastVisit ? 
                                        new Date(patientData.dentalHistory.lastVisit).toLocaleDateString() : "Never"}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Next Appointment</span>
                                <span className="value">
                                    {patientData.dentalHistory.nextAppointment ? 
                                        new Date(patientData.dentalHistory.nextAppointment).toLocaleDateString() : "None scheduled"}
                                </span>
                            </div>
                            <div className="info-item full-width">
                                <span className="label">Recent Procedures</span>
                                <div className="procedures-list">
                                    {patientData.dentalHistory.procedures.length > 0 ? (
                                        patientData.dentalHistory.procedures.map((procedure, index) => (
                                            <div key={index} className="procedure-item">
                                                <span className="procedure-name">{procedure.name}</span>
                                                <span className="procedure-date">
                                                    {new Date(procedure.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="value">No procedures recorded</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewPatientData;