# ToothTone Patient Dashboard API

## نظرة عامة
هذا الـ API مخصص لإدارة لوحة تحكم المريض في نظام ToothTone. يوفر endpoints للحصول على معلومات المريض والمواعيد والنشاطات.

## المتطلبات
- .NET 8.0
- SQL Server (LocalDB أو SQL Server Express)
- Visual Studio 2022 أو VS Code

## التثبيت والتشغيل

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd ToothToneAPI
```

### 2. تثبيت الحزم المطلوبة
```bash
dotnet restore
```

### 3. تشغيل المشروع
```bash
dotnet run
```

### 4. الوصول إلى Swagger UI
افتح المتصفح واذهب إلى: `https://localhost:7001/swagger`

## API Endpoints

### معلومات المريض
```
GET /api/PatientDashboard/patient-info/{patientId}
```
**الاستجابة:**
```json
{
  "id": 1,
  "name": "John Patel",
  "dateOfBirth": "1985-05-12T00:00:00",
  "status": "Active",
  "bloodType": "A+",
  "primaryDoctor": "Dr. Sarah Wilson",
  "nextAppointment": "2025-05-24T00:00:00"
}
```

### مواعيد المريض
```
GET /api/PatientDashboard/appointments/{patientId}
```
**الاستجابة:**
```json
[
  {
    "id": 1,
    "doctorName": "Dr. Sarah Wilson",
    "specialty": "Primary Care",
    "appointmentDate": "2025-05-24T00:00:00",
    "appointmentTime": "10:30:00",
    "status": "Cancelled",
    "notes": "Patient requested cancellation"
  }
]
```

### نشاطات المريض
```
GET /api/PatientDashboard/activities/{patientId}
```
**الاستجابة:**
```json
[
  {
    "id": 1,
    "type": "Appointment",
    "status": "completed",
    "activityDate": "2025-05-02T09:15:00",
    "description": "Appointment with Dr. Sarah Wilson - Primary Care",
    "relatedEntityId": 3,
    "relatedEntityType": "Appointment"
  }
]
```

### ملخص لوحة التحكم
```
GET /api/PatientDashboard/summary/{patientId}
```
**الاستجابة:**
```json
{
  "patientId": 1,
  "patientName": "John Patel",
  "totalAppointments": 3,
  "upcomingAppointments": 1,
  "completedAppointments": 1,
  "recentActivities": 3,
  "lastLoginDate": "2025-01-27T10:30:00"
}
```

### تسجيل نشاط جديد
```
POST /api/PatientDashboard/record-activity
```
**الطلب:**
```json
{
  "patientId": 1,
  "type": "Appointment",
  "status": "scheduled",
  "description": "New appointment scheduled",
  "relatedEntityId": 4,
  "relatedEntityType": "Appointment"
}
```

## قاعدة البيانات

### الجداول الرئيسية:
- **Patients**: معلومات المرضى
- **Doctors**: معلومات الأطباء
- **Appointments**: المواعيد
- **PatientActivities**: نشاطات المرضى

### البيانات الأولية:
يتم إنشاء بيانات تجريبية تلقائياً عند تشغيل التطبيق لأول مرة.

## التكامل مع Frontend

### تحديث PatientDashboard.jsx
```javascript
import React, { useState, useEffect } from "react";
import './PatientDashboard.css';
import { FaUserMd, FaCalendarAlt, FaPlus } from "react-icons/fa";
import Notification from '../../components/Notification';

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  const patientId = 1; // سيتم الحصول عليه من authentication

  useEffect(() => {
    fetchPatientData();
    checkLoginSuccess();
  }, []);

  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes, activitiesRes] = await Promise.all([
        fetch(`/api/PatientDashboard/patient-info/${patientId}`),
        fetch(`/api/PatientDashboard/appointments/${patientId}`),
        fetch(`/api/PatientDashboard/activities/${patientId}`)
      ]);

      const patientData = await patientRes.json();
      const appointmentsData = await appointmentsRes.json();
      const activitiesData = await activitiesRes.json();

      setPatient(patientData);
      setAppointments(appointmentsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotification({
        isVisible: true,
        message: 'Error loading patient data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLoginSuccess = () => {
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
        
        localStorage.removeItem('loginSuccess');
        
        setTimeout(() => {
          setNotification(prev => ({ ...prev, isVisible: false }));
        }, 8000);
      } catch (error) {
        console.error('Error parsing login success data:', error);
        localStorage.removeItem('loginSuccess');
      }
    }
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
      
      {patient && (
        <div className="patient-header">
          <div className="patient-avatar"></div>
          <div className="patient-info">
            <div className="patient-main">
              <h2>{patient.name}</h2>
              <span className="patient-id">ID: {patient.id}</span>
              <span className="patient-dob">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              <span className="patient-status">{patient.status}</span>
            </div>
            <div className="patient-details">
              <div>
                <span className="label">Blood Type</span>
                <span>{patient.bloodType}</span>
              </div>
              <div>
                <span className="label">Next Appointment</span>
                <span>{patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="patient-tabs">
        <button className="tab active">Overview</button>
      </div>

      <div className="dashboard-content">
        <div className="appointments-section">
          <div className="appointments-header">
            <h3><FaCalendarAlt /> Appointments</h3>
          </div>
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div className="appointment-card" key={appointment.id}>
                <div>
                  <div className="doctor-name">{appointment.doctorName}</div>
                  <div className="specialty">{appointment.specialty}</div>
                </div>
                <div className="appointment-meta">
                  <span>{new Date(appointment.appointmentDate).toLocaleDateString()} • {appointment.appointmentTime}</span>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
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
```

## الأمان
- يجب إضافة JWT Authentication
- يجب إضافة Authorization للتحكم في الوصول
- يجب إضافة Rate Limiting
- يجب إضافة Input Validation

## التطوير المستقبلي
- إضافة Real-time notifications
- إضافة File upload للمستندات الطبية
- إضافة Chat system بين المريض والطبيب
- إضافة Payment integration
- إضافة Mobile app support

## الدعم
للمساعدة أو الاستفسارات، يرجى التواصل مع فريق التطوير.
