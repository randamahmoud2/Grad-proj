import React, { useState, useEffect } from "react";
import './PatientDashboard.css';
import { FaUserMd, FaCalendarAlt, FaPlus } from "react-icons/fa";
import Notification from '../../components/Notification';

const patient = {
  name: "John Patel",
  id: "PTN-24680",
  dob: "05/12/1985",
  status: "Active Patient",
  bloodType: "A+",
  primaryDoctor: "Dr. Sarah Wilson",
  nextAppointment: "May 24, 2025"
};

const appointments = [
  {
    doctor: "Dr. Sarah Wilson",
    specialty: "Primary Care",
    date: "May 24, 2025",
    time: "10:30 AM",
    status: "Cancelled"
  },
  {
    doctor: "Dr. Michael Chen",
    specialty: "Cardiology",
    date: "June 12, 2025",
    time: "2:00 PM",
    status: "Upcoming"
  },
  {
    doctor: "Dr. Emily Johnson",
    specialty: "Dermatology",
    date: "May 2, 2025",
    time: "9:15 AM",
    status: "Completed"
  }
];

const activity = [
  {
    type: "Appointment",
    status: "completed",
    date: "May 2, 2025 • 9:15 AM",
    desc: "with Dr. Sarah Wilson - Primary Care"
  },
  {
    type: "Lab results",
    status: "received",
    date: "May 1, 2025 • 2:30 PM",
    desc: "Blood work panel - Within normal ranges"
  },
  {
    type: "Message",
    status: "from Dr. Wilson",
    date: "May 1, 2025 • 11:05 AM",
    desc: "Regarding your recent lab results"
  }
];

const PatientDashboard = () => {
  // Notification state for login success
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // Check for login success on component mount
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
        
        // Remove the login success data from localStorage
        localStorage.removeItem('loginSuccess');
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, isVisible: false }));
        }, 8000);
      } catch (error) {
        console.error('Error parsing login success data:', error);
        localStorage.removeItem('loginSuccess');
      }
    }
  }, []);

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="patient-dashboard-portal">
      {/* Notification Component */}
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
            {appointments.map((a, i) => (
              <div className="appointment-card" key={i}>
                <div>
                  <div className="doctor-name">{a.doctor}</div>
                  <div className="specialty">{a.specialty}</div>
                </div>
                <div className="appointment-meta">
                  <span>{a.date} • {a.time}</span>
                  <span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;