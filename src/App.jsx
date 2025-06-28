import './App.css';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Docs from './pages/Doctor/Docs.jsx';
import Image from './pages/Doctor/Image.jsx';
import Scdeule from './pages/Doctor/Scdeule.jsx';
import { Profile } from './pages/Doctor/Profile.jsx';
import { Patient } from './pages/Doctor/Patient.jsx'; 
import PerioChart from './pages/Doctor/Periodental.jsx';
import { Dashboard } from './pages/Doctor/Dashboard.jsx';
import Prescription from './pages/Doctor/Prescription.jsx';
import DoctorLayout from './pages/Doctor/DoctorLayout.jsx';
import ManagerLayout from './pages/manager/ManagerLayout.jsx';
import PatientLayout from './pages/Patient/PatientLayout.jsx';
import AddPrescription from './pages/Doctor/AddPrescription.jsx';
import Editprescription from './pages/Doctor/Editprescription.jsx';
import PatientDashboard from './pages/Patient/PatientDashboard.jsx';
import Finance from './componenet/ManagerComponent/Finance/Finance.jsx';
import StaffList from './componenet/ManagerComponent/Staff/List/List.jsx';
import Upload from './componenet/patientComponnent/Upload/UploadInfo.jsx';
import ReceptionistLayout from './pages/Reciption/ReciptionaistLayout.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientFinance from './componenet/patientComponnent/Finance/Finance.jsx';
import Attendence from './componenet/ManagerComponent/Attendance/Attendence.jsx';
import DoctorList from './componenet/patientComponnent/AllDoctors/DoctorList.jsx';
import AllDoctors from './componenet/patientComponnent/AllDoctors/AllDoctors.jsx';
import Patientupload from './componenet/Doctorcomponent/Uplaod/Patientupload.jsx';
import UploadImgDoc from './componenet/patientComponnent/Upload/UploadImageDoc.jsx';
import ManagerDasboard from './componenet/ManagerComponent/Dashboard/Dashboard.jsx';
import DocSchdeule from './componenet/ManagerComponent/Doctor Schdeule/Schdeule.jsx';
import ResBooking from './componenet/ReciptionaistComponent/Appointment/Booking.jsx';
import DoctorFinancial from './componenet/Doctorcomponent/DocFinance/DocFinance.jsx';
import StaffApproval from './componenet/ManagerComponent/Staff/Approval/Approval.jsx';
import NewPatient from './componenet/ReciptionaistComponent/NewPatient/NewPatient.jsx';
import ResAppoint from './componenet/ReciptionaistComponent/Appointment/Appointment.jsx';
import PatientData from './componenet/ReciptionaistComponent/patientData/PatientData.jsx';
import ReciptionaistProfile from './componenet/ReciptionaistComponent/Profile/Profile.jsx';
import PatientAppointment from './componenet/patientComponnent/Appointment/Appointment.jsx';
import ManagerProfile from './componenet/ManagerComponent/managerProfile/ManageProfile.jsx';
import DocAttendance from './componenet/Doctorcomponent/DocAttendance/AttendanceTracker.jsx';
import ShowAppointment from './componenet/patientComponnent/Appointment/ٍShowAppointment.jsx';
import ProfilePatient from './componenet/patientComponnent/patientProfile/ProfilePatient.jsx';
import ReciptionaistFinancial from './componenet/ReciptionaistComponent/Finance/ResFinance.jsx';
import ReciptionaistDashboard from './componenet/ReciptionaistComponent/Dashboard/Dashboard.jsx';
import SelectAppoint from './componenet/ReciptionaistComponent/Appointment/Selectappointment.jsx';
import ViewPatientData from './componenet/ReciptionaistComponent/patientData/ViewPatientData.jsx';
import ReciptionaistAttendance from './componenet/ReciptionaistComponent/Attendance/ResAttendence.jsx';
import ViewPatientPayment from './componenet/ReciptionaistComponent/patientData/ViewPatientPayment.jsx';
import ShowAllAppointments from './componenet/ReciptionaistComponent/Appointment/ShowAllAppointments.jsx';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>


                <Route path='/Reciptionaist/Patient/:id/Book/:docId' element={<SelectAppoint />}/>





                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Patient routes */}
                    <Route
                        path="/Patient/*"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="Dashboard" element={<PatientDashboard />} />
                        <Route path="Doctors" element={<DoctorList />} />
                        <Route path="AllDoctors" element={<AllDoctors />} />
                        <Route path="Profile" element={<ProfilePatient />} />
                        <Route path="Finance" element={<PatientFinance />} />
                        <Route path="ShowAppointment" element={<ShowAppointment />} />
                        <Route path="Doctors/:docId" element={<Upload />} />
                        <Route path="Doctors/:docId/Upload" element={<UploadImgDoc />} />
                        <Route path="appointment/:docId" element={<PatientAppointment />} />
                    </Route>

                    {/* Doctor routes */}
                    <Route
                        path="/Doctor/*"
                        element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <DoctorLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="Profile" element={<Profile />} />
                        <Route path="Patient" element={<Patient />} />
                        <Route path="Schdeule" element={<Scdeule />} />
                        <Route path="Dashboard" element={<Dashboard />} />
                        <Route path="Patient/:id/Docs" element={<Docs />} />
                        <Route path="Patient/:id/Image" element={<Image />} />
                        <Route path="Attendance" element={<DocAttendance />} />
                        <Route path="Financial" element={<DoctorFinancial />} />
                        <Route path="Patient/:id/Upload" element={<Patientupload />} />
                        <Route path="Patient/:id/PerioChart" element={<PerioChart />} />
                        <Route path="Patient/:id/Prescription" element={<Prescription />} />
                        <Route path="Patient/:id/Prescription/update" element={<Editprescription />} />
                        <Route path="Patient/:id/Prescription/AddPrescription" element={<AddPrescription />} /> 
                    </Route>


                    {/* Receptionist routes */}
                    <Route
                        path="/Receptionist/*"
                        element={
                            <ProtectedRoute allowedRoles={['receptionist']}>
                                <ReceptionistLayout/>
                            </ProtectedRoute>
                        }
                    >

                        <Route path="Patient/:id" element={<ResAppoint/>}/>
                        <Route path="ADDPatient" element={<NewPatient />} />
                        <Route path="PatientList" element={<PatientData />} />
                        <Route path="Patient/:id/Book" element={<ResBooking />} />
                        <Route path="Profile" element={<ReciptionaistProfile />} />
                        <Route path="Financial" element={<ReciptionaistFinancial />} />
                        <Route path="Dashboard" element={<ReciptionaistDashboard />} />
                        <Route path="Attendance" element={<ReciptionaistAttendance />} />
                        <Route path="ShowAppointment" element={<ShowAllAppointments />} />
                        <Route path="Patient/:id/Book/:docId" element={<SelectAppoint />} />
                        <Route path="Patient/:id/Patient Profile" element={<ViewPatientData />} />
                        <Route path="Patient/:id/Patient Payment" element={<ViewPatientPayment />} />
                    </Route>

                    {/* Manager routes */}
                    <Route
                        path="/Manager/*"
                        element={
                            <ProtectedRoute allowedRoles={['manager']}>
                                <ManagerLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="Dashboard" element={<ManagerDasboard />} />
                        <Route path="Profile" element={<ManagerProfile />} />
                        <Route path="Financial" element={<Finance />} />
                        <Route path="StaffList" element={<StaffList />} />
                        <Route path="StaffApproval" element={<StaffApproval />} />
                        <Route path="Doctor/Schedule" element={<DocSchdeule />} />
                        <Route path="Staff/Attendance" element={<Attendence />} />
                    </Route>

                    {/* Redirect root to login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
