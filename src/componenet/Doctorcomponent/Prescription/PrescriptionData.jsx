import React, { useState, useEffect } from 'react';
import './PrescriptionData.css';
import Delete from "../../../image/delete.png";
import { useParams, useNavigate } from 'react-router-dom';

export const PrescriptionData = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // جلب بيانات المريض
                const patientResponse = await fetch(`http://localhost:5068/api/Patients/${id}`);
                if (!patientResponse.ok) throw new Error('Failed to fetch patient data');
                const patientData = await patientResponse.json();
                setPatient(patientData);

                // جلب الوصفات الطبية
                const prescriptionsResponse = await fetch(`http://localhost:5068/api/Prescriptions/patient/${id}`);
                if (!prescriptionsResponse.ok) throw new Error('Failed to fetch prescriptions');
                const prescriptionsData = await prescriptionsResponse.json();
                setPrescriptions(prescriptionsData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleDelete = async (prescriptionId) => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this prescription?');
            if (!confirmDelete) return;
            
            const response = await fetch(`http://localhost:5068/api/Prescriptions/${prescriptionId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete prescription');
            
            // تحديث القائمة بعد الحذف
            setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
            
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className='prescription'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Prescription</p>
                    </div>
                </div>
                <hr id="split"/>
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='prescription'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Prescription</p>
                    </div>
                </div>
                <hr id="split"/>
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className='prescription'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Prescription</p>
                    </div>
                </div>
                <hr id="split"/>
                <div>Patient not found</div>
            </div>
        );
    }

    return (
        <div className='prescription'>
            <div className='data2'>
                <div className='title2'>
                    <p>Prescription</p>
                    <p id="name">{patient.name} / {patient.id}</p>
                </div>
                <button 
                    className='add' 
                    onClick={() => navigate(`/Doctor/Patient/${id}/Prescription/AddPrescription`)}
                >
                    ADD
                </button>
            </div>
            <hr id="split"/>
            <table className='table3'>
                <thead>
                    <tr style={{background:"rgba(216, 211, 211, 0.851)"}}>
                        <th></th>
                        <th>Date</th>
                        <th>Provider</th>
                        <th>Modified On</th>
                        <th>Modified By</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.length > 0 ? (
                        prescriptions.map(prescription => (
                            <tr 
                                className='special' 
                                key={prescription.id} 
                                style={{fontWeight: "800", fontSize: "12px"}}
                            >
                                <td>
                                    <img 
                                        src={Delete} 
                                        alt="Delete" 
                                        style={{width: "15px", display: "flex", alignItems: "center", cursor: "pointer"}}
                                        onClick={() => handleDelete(prescription.id)}
                                    />
                                </td>
                                <td>{prescription.date || ''}</td>
                                <td>{prescription.doctorName || ''}</td>
                                <td>{prescription.modifiedDate || ''}</td>
                                <td>{prescription.modifiedBy || ''}</td>
                                <td>{prescription.status || ''}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{textAlign: 'center'}}>
                                No prescriptions found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PrescriptionData;