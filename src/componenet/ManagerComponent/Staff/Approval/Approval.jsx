import './Approval.css';
import React, { useState } from 'react';

const StaffApproval = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffData, setStaffData] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarahj@example.com",
      role: "Doctor",
      specialty: "Orthodontist",
      experience: "8 years",
      appliedOn: "6/1/2023, 1:45:30 PM",
      status: "pending"
    },
    {
      id: 2,
      name: "Robert Williams",
      email: "robertw@example.com",
      role: "Receptionist",
      experience: "5 years",
      appliedOn: "6/4/2023, 2:10:05 PM",
      status: "pending"
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emilyd@example.com",
      role: "Receptionist",
      experience: "3 years",
      appliedOn: "6/5/2023, 4:54:20 PM",
      status: "pending"
    }
  ]);

  const handleApprove = () => {
    if (selectedStaff) {
      const updatedStaff = staffData.map(staff =>
        staff.id === selectedStaff.id
          ? { ...staff, status: 'approved' }
          : staff
      );
      setStaffData(updatedStaff.filter(staff => staff.id !== selectedStaff.id));
      setSelectedStaff(null);
    }
  };

  const handleReject = () => {
    if (selectedStaff) {
      const updatedStaff = staffData.map(staff =>
        staff.id === selectedStaff.id
          ? { ...staff, status: 'rejected' }
          : staff
      );
      setStaffData(updatedStaff.filter(staff => staff.id !== selectedStaff.id));
      setSelectedStaff(null);
    }
  };

  return (
    <div className="container1">
      <div className="data2">
        <div className="title2">
          <p>Staff Approval Requests</p>
        </div>
        <hr id="split" />
      </div>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Applied On</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {staffData.map((staff) => (
            <tr key={staff.id} className="row">
              <td>{staff.name}</td>
              <td>
                <span className={`role-badge ${staff.role.toLowerCase()}`}>
                  {staff.role}
                </span>
              </td>
              <td>{staff.email}</td>
              <td>{staff.appliedOn}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => setSelectedStaff(staff)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
          {staffData.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                No pending approval requests
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedStaff && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Staff Details</h3>
              <button className="close-button" onClick={() => setSelectedStaff(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name</span>
                  <span className="info-value">{selectedStaff.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value">{selectedStaff.role}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{selectedStaff.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Experience</span>
                  <span className="info-value">{selectedStaff.experience}</span>
                </div>
                {selectedStaff.specialty && (
                  <div className="info-item">
                    <span className="info-label">Specialty</span>
                    <span className="info-value">{selectedStaff.specialty}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Applied On</span>
                  <span className="info-value">{selectedStaff.appliedOn}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="reject-button" onClick={handleReject}>Reject</button>
              <button className="approve-button" onClick={handleApprove}>Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffApproval;
