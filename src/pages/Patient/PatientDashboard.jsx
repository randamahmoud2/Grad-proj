import React, { useState, useEffect } from "react";
import './PatientDashboard.css';
import { FaUserMd, FaCalendarAlt, FaPlus } from "react-icons/fa";
import Notification from '../../components/Notification';

const API_BASE_URL = "http://localhost:5068/api";

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    patient: null,
    upcomingAppointments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  const patientId = localStorage.getItem('patientId');

  useEffect(() => {
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess) {
      try {
        const loginData = JSON.parse(loginSuccess);
        const roleDisplay = loginData.role.charAt(0).toUpperCase() + loginData.role.slice(1);
        const successMessage = `🎉 Welcome back, ${loginData.name}! Successfully logged in as ${roleDisplay}.`;
        
        setNotification({
          isVisible: true,
          message: successMessage,
          type: 'success'
        });
        
        setTimeout(() => {
          setNotification(prev => ({ ...prev, isVisible: false }));
        }, 8000);
        
        localStorage.removeItem('loginSuccess');
      } catch (error) {
        console.error('Error parsing login success data:', error);
        localStorage.removeItem('loginSuccess');
      }
    }

    const fetchDashboardData = async () => {
      if (!patientId) {
        setNotification({
          isVisible: true,
          message: 'Please log in to view your dashboard',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching dashboard data for patient ID: ${patientId}`);
        const response = await fetch(`${API_BASE_URL}/Patients/${patientId}/dashboard`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `Failed to fetch dashboard data: ${response.status}`);
        }
        const data = await response.json();
        console.log('Dashboard data fetched:', data);

        setDashboardData({
          patient: {
            id: data.patient?.patientId || data.patient?.id || 'N/A',
            name: data.patient?.name || 'Unknown Patient',
            dob: data.patient?.dob ? new Date(data.patient.dob).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A',
            status: data.patient?.status || 'Active Patient',
            bloodType: data.patient?.bloodType || 'N/A',
            nextAppointment: data.patient?.nextAppointment ? new Date(data.patient.nextAppointment).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'
          },
          upcomingAppointments: data.upcomingAppointments?.map(appt => ({
            doctor: appt.doctorName || appt.doctor || 'N/A',
            specialty: appt.specialty || 'N/A',
            date: appt.date ? new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A',
            time: appt.time || appt.timeSlot || 'N/A',
            status: appt.status || 'N/A',
            procedure: appt.procedure || 'N/A'
          })) || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setNotification({
          isVisible: true,
          message: 'Failed to load dashboard data',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [patientId]);

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  if (isLoading) {
    return (
      <div className="patient-dashboard-portal">
        {notification.isVisible && (
          <Notification
            isVisible={notification.isVisible}
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
            autoClose={true}
            duration={8000}
          />
        )}
        <div>Loading patient data...</div>
      </div>
    );
  }

  if (!dashboardData.patient) {
    return (
      <div className="patient-dashboard-portal">
        {notification.isVisible && (
          <Notification
            isVisible={notification.isVisible}
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
            autoClose={true}
            duration={8000}
          />
        )}
        <div>Error: Unable to load patient data</div>
      </div>
    );
  }

  const { patient, upcomingAppointments } = dashboardData;

  return (
    <div className="patient-dashboard-portal">
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          autoClose={true}
          duration={8000}
        />
      )}
      
      <div className="patient-header">
        <div className="patient-avatar"></div>
        <div className="patient-info">
          <div className="patient-main">
            <h2>{patient.name}</h2>
            <span className="patient-id">ID: {patient.id}</span>
            <span className="patient-dob">DOB: {patient.dob}</span>
            <span className="patient-status">{patient.status}</span>
          </div>
          <div className="patient-details">
            <div>
              <span className="label">Blood Type</span>
              <span>{patient.bloodType}</span>
            </div>
            <div>
              <span className="label">Next Appointment</span>
              <span>{patient.nextAppointment}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="patient-tabs">
        <button className="tab active">Overview</button>
      </div>

      <div className="dashboard-content">
        <div className="appointments-section">
          <div className="appointments-header">
            <h3><FaCalendarAlt /> Appointments</h3>
          </div>
          <div className="appointments-list">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((a, i) => (
                <div className="appointment-card" key={i}>
                  <div>
                    <div className="doctor-name">{a.doctor}</div>
                    <div className="specialty">{a.specialty}</div>
                  </div>
                  <div className="appointment-meta">
                    <span>{a.date} • {a.time}</span>
                    <span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
                    <span className="procedure">{a.procedure}</span>
                  </div>
                </div>
              ))
            ) : (
              <div>No appointments available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;