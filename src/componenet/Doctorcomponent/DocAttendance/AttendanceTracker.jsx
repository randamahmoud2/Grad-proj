import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt, FaMapMarkerAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import './AttendanceTracker.css';

const AttendanceTracker = () => {
  const API_BASE_URL = "http://localhost:5068/api/attendance";
  const doctorId = 1; // Replace with actual doctor ID from authentication

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [status, setStatus] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState('');

  const hospitalLocation = {
    lat: 30.0444, 
    lng: 31.2357, 
    radius: 200, 
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadAttendanceData = async () => {
      setIsLoading(true);
      try {
        // Load today's status
        const statusResponse = await fetch(`${API_BASE_URL}/today/${doctorId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.isCheckedIn) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(statusData.checkInTime));
          setStatus(statusData.status);
          setCurrentRecordId(statusData.id);
        }

        // Load history
        const historyResponse = await fetch(`${API_BASE_URL}/history/${doctorId}`);
        const historyData = await historyResponse.json();
        
        // Convert to frontend format
        const formattedHistory = historyData.map(record => ({
          id: record.id,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut || '--:-- --',
          status: record.status,
          workingHours: record.workingHours,
          location: record.location
        }));
        
        setAttendanceHistory(formattedHistory);
      } catch (error) {
        console.error("Error loading attendance data:", error);
        setApiMessage("Failed to load attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [doctorId]);

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    setLocationError('');
    setApiMessage('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(userLocation);
        
        // Verify if user is within hospital area
        const isWithinHospital = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          hospitalLocation.lat, 
          hospitalLocation.lng
        ) <= hospitalLocation.radius;
        
        setIsLocationVerified(isWithinHospital);
        setShowMap(true);
        setIsLoading(false);
        
        if (!isWithinHospital) {
          setApiMessage('You must be within hospital premises to check in/out');
        }
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsLocationVerified(false);
        setIsLoading(false);
        setApiMessage('Location access denied. Please enable location services.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  // Handle check-in with location verification
  const handleCheckIn = async () => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }

    if (!isLocationVerified) {
      setApiMessage('You must be within hospital premises to check in');
      return;
    }

    setIsLoading(true);
    setApiMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctorId,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const checkInTime = new Date(data.checkInTime);
      
      setCheckInTime(checkInTime);
      setIsCheckedIn(true);
      setStatus(data.status);
      setCurrentRecordId(data.id);
      setShowMap(false);
      setApiMessage(data.message);
      
      // Refresh history
      const historyResponse = await fetch(`${API_BASE_URL}/history/${doctorId}`);
      const historyData = await historyResponse.json();
      const formattedHistory = historyData.map(record => ({
        id: record.id,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut || '--:-- --',
        status: record.status,
        workingHours: record.workingHours,
        location: record.location
      }));
      setAttendanceHistory(formattedHistory);
    } catch (error) {
      console.error("Check-in error:", error);
      setApiMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out with location verification
  const handleCheckOut = async () => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }

    if (!isLocationVerified) {
      setApiMessage('You must be within hospital premises to check out');
      return;
    }

    if (!currentRecordId) {
      setApiMessage('No active check-in record found');
      return;
    }

    setIsLoading(true);
    setApiMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceRecordId: currentRecordId,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const checkOutTime = new Date();
      
      setCheckOutTime(checkOutTime);
      setIsCheckedIn(false);
      setApiMessage(data.message);
      
      // Update local history
      const newRecord = {
        id: currentRecordId,
        date: currentDate,
        checkIn: checkInTime.toLocaleTimeString(),
        checkOut: checkOutTime.toLocaleTimeString(),
        status: status,
        workingHours: data.workingHours,
        location: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
      };
      
      setAttendanceHistory(prev => [newRecord, ...prev.filter(r => r.id !== currentRecordId)]);
      setCurrentRecordId(null);
    } catch (error) {
      console.error("Check-out error:", error);
      setApiMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (currentLocation) {
      const mapsUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      window.open(mapsUrl, '_blank');
    } else {
      getCurrentLocation();
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <div className="attendance-header">
          <p><FaCalendarAlt className="header-icon" /> Doctor Attendance Portal</p>
          <div className="datetime-display">
            <div className="date-display">
              <span className="label">Date:</span> {currentDate}
            </div>
            <div className="time-display">
              <span className="label">Time:</span> {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {apiMessage && (
          <div className={`api-message ${apiMessage.includes('successfully') ? 'success' : 'error'}`}>
            {apiMessage}
          </div>
        )}
        
        <div className="status-container">
          <div className="status-card">
            {isCheckedIn ? (
              <div className="checked-in-status">
                <div className="status-icon success">
                  <FaCheck />
                </div>
                <div className="status-info">
                  <h3>You are checked in</h3>
                  <p>Check-in time: <strong>{checkInTime?.toLocaleTimeString() || '--:-- --'}</strong></p>
                  <div className={`status-badge ${status.toLowerCase()}`}>{status}</div>
                </div>
              </div>
            ) : (
              <div className="checked-out-status">
                <div className="status-icon neutral">
                  <FaSignInAlt />
                </div>
                <div className="status-info">
                  <h3>Not Checked In</h3>
                  <p>Please check in to start your shift</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              className={`btn-action check-in ${isCheckedIn ? 'disabled' : ''}`} 
              onClick={handleCheckIn} 
              disabled={isCheckedIn || isLoading}
            >
              {isLoading ? <FaSpinner className="icon-spin" /> : <FaSignInAlt />}
              {isLoading ? "Processing..." : isLocationVerified ? "Check In" : "Verify & Check In"}
            </button>
            
            <button 
              className={`btn-action check-out ${!isCheckedIn ? 'disabled' : ''}`} 
              onClick={handleCheckOut} 
              disabled={!isCheckedIn || isLoading}
            >
              {isLoading ? <FaSpinner className="icon-spin" /> : <FaSignOutAlt />}
              {isLoading ? "Processing..." : isLocationVerified ? "Check Out" : "Verify & Check Out"}
            </button>
            
            <button 
              className="btn-action map-btn" 
              onClick={openGoogleMaps}
              disabled={isLoading || !currentLocation}
            >
              <FaMapMarkerAlt /> View Map
            </button>
          </div>
        </div>
        
        {showMap && (
          <div className="location-card">
            <div className="location-header">
              <h3>Location Verification</h3>
              {isLocationVerified ? (
                <div className="verification-badge success">Verified</div>
              ) : (
                <div className="verification-badge error">Not Verified</div>
              )}
            </div>
            <div className="location-content">
              {locationError ? (
                <div className="location-error">
                  <FaTimes className="error-icon" />
                  <p>{locationError}</p>
                </div>
              ) : currentLocation ? (
                <div className="location-info">
                  <div className="coordinates">
                    <p><strong>Your coordinates:</strong></p>
                    <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
                    <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
                  </div>
                  <div className="verification-status">
                    <p className={isLocationVerified ? "success-text" : "error-text"}>
                      {isLocationVerified 
                        ? "✓ You are within hospital vicinity" 
                        : "✗ You are not within hospital vicinity"}
                    </p>
                    <button className="btn-map" onClick={openGoogleMaps}>
                      <FaMapMarkerAlt /> Open in Google Maps
                    </button>
                  </div>
                </div>
              ) : (
                <div className="location-loading">
                  <FaSpinner className="loading-icon icon-spin" />
                  <p>Getting your location...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="attendance-history-section">
          <h3>Attendance History</h3>
          
          {attendanceHistory.length === 0 ? (
            <div className="empty-history">
              <p>No attendance records yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.slice(0, 5).map((record) => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>{record.checkIn}</td>
                      <td>{record.checkOut}</td>
                      <td>
                        <div className={`table-badge ${record.status.toLowerCase()}`}>
                          {record.status}
                        </div>
                      </td>
                      <td>{record.workingHours} hrs</td>
                      <td>
                        <button 
                          className="btn-location" 
                          onClick={() => window.open(`https://www.google.com/maps?q=${record.location}`, '_blank')}
                        >
                          <FaMapMarkerAlt /> Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {attendanceHistory.length > 5 && (
                <div className="view-more">
                  <p>Showing 5 most recent records out of {attendanceHistory.length}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;