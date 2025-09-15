import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt, FaMapMarkerAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AttendanceTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [status, setStatus] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [currentRecordId, setCurrentRecordId] = useState(null); // لتخزين ID سجل الحضور

  const navigate = useNavigate();
  const receptionistId = localStorage.getItem('receptionistId');
  const API_BASE_URL = 'http://localhost:5068/api/attendance';

  const hospitalLocation = {
    lat: 30.012258932723245, // إحداثيات Nile University
    lng: 30.987065075068312,
    radius: 2000, // بالمتر
  };

  // تحقق من تسجيل الدخول
  useEffect(() => {
    if (!receptionistId) {
      setApiMessage('Please log in to view attendance data');
      navigate('/login');
    }
  }, [receptionistId, navigate]);

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // جلب سجل الحضور من الباك إند
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!receptionistId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/history?userId=${receptionistId}&userType=Receptionist`);
        const data = await response.json();
        if (response.ok) {
          setAttendanceHistory(data.map(record => ({
            date: new Date(record.date).toLocaleDateString(),
            checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
            checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
            status: record.status,
            workingHours: record.workingHours ? record.workingHours.toFixed(2) : '0.00',
            location: record.locationCoordinates || '-'
          })));
        } else {
          setApiMessage(data.message || 'Error fetching attendance history');
        }
      } catch (error) {
        setApiMessage('Error connecting to server');
      }
    };

    const fetchTodayAttendance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/today?userId=${receptionistId}&userType=Receptionist`);
        const data = await response.json();
        if (response.ok && data) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(data.checkInTime));
          setStatus(data.status);
          setCurrentRecordId(data.id);
          setCurrentLocation({
            lat: parseFloat(data.locationCoordinates.split(',')[0]),
            lng: parseFloat(data.locationCoordinates.split(',')[1])
          });
          setIsLocationVerified(true);
        }
      } catch (error) {
        // لا يوجد سجل اليوم، عادي
      }
    };

    fetchAttendanceHistory();
    fetchTodayAttendance();
  }, [receptionistId]);

  // الحصول على الموقع الحالي
  const getCurrentLocation = () => {
    setIsLoading(true);
    setLocationError('');

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

        // التحقق من الموقع
        const isWithinHospital = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hospitalLocation.lat,
          hospitalLocation.lng
        ) <= hospitalLocation.radius;

        setIsLocationVerified(isWithinHospital);
        setShowMap(true);
        setIsLoading(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsLocationVerified(false);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // حساب المسافة باستخدام صيغة Haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // نصف قطر الأرض بالمتر
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // المسافة بالمتر
  };

  // تسجيل الحضور
  const handleCheckIn = async () => {
    if (!isLocationVerified) {
      getCurrentLocation();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(receptionistId),
          userType: 'Receptionist',
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCheckInTime(new Date(data.checkInTime));
        setIsCheckedIn(true);
        setStatus(data.status);
        setCurrentRecordId(data.id);
        setApiMessage('Check-in successful');
        setShowMap(false);
      } else {
        setApiMessage(data.message || 'Check-in failed');
      }
    } catch (error) {
      setApiMessage('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  // تسجيل الانصراف
  const handleCheckOut = async () => {
    if (!isLocationVerified) {
      getCurrentLocation();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: currentRecordId,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      });

      const data = await response.json();
      if (response.ok) {
        const now = new Date(data.checkOutTime);
        setCheckOutTime(now);
        setIsCheckedIn(false);

        const checkInDateTime = new Date(checkInTime);
        const hours = ((now - checkInDateTime) / 1000 / 60 / 60).toFixed(2);

        const newAttendanceRecord = {
          date: currentDate,
          checkIn: checkInTime.toLocaleTimeString(),
          checkOut: now.toLocaleTimeString(),
          status: status,
          workingHours: hours,
          location: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
        };

        setAttendanceHistory(prevHistory => [newAttendanceRecord, ...prevHistory]);
        setCheckInTime(null);
        setCheckOutTime(null);
        setStatus('');
        setIsLocationVerified(false);
        setShowMap(false);
        setCurrentRecordId(null);
        setApiMessage('Check-out successful');
      } else {
        setApiMessage(data.message || 'Check-out failed');
      }
    } catch (error) {
      setApiMessage('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  // فتح خريطة جوجل
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
          <p><FaCalendarAlt className="header-icon" /> Receptionist Attendance Portal</p>
          <div className="datetime-display">
            <div className="date-display">
              <span className="label">Date:</span> {currentDate}
            </div>
            <div className="time-display">
              <span className="label">Time:</span> {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {apiMessage && <div className="api-message">{apiMessage}</div>}

        <div className="status-container">
          <div className="status-card">
            {isCheckedIn ? (
              <div className="checked-in-status">
                <div className="status-icon success">
                  <FaCheck />
                </div>
                <div className="status-info">
                  <h3>You are checked in</h3>
                  <p>Check-in time: <strong>{checkInTime?.toLocaleTimeString()}</strong></p>
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
              {isLoading ? "Verifying..." : isLocationVerified ? "Check In" : "Verify & Check In"}
            </button>

            <button
              className={`btn-action check-out ${!isCheckedIn ? 'disabled' : ''}`}
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isLoading}
            >
              {isLoading ? <FaSpinner className="icon-spin" /> : <FaSignOutAlt />}
              {isLoading ? "Verifying..." : isLocationVerified ? "Check Out" : "Verify & Check Out"}
            </button>

            <button
              className="btn-action map-btn"
              onClick={openGoogleMaps}
              disabled={isLoading}
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
                  {attendanceHistory.slice(0, 5).map((record, index) => (
                    <tr key={index}>
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
                        <button className="btn-location" onClick={() => openGoogleMaps()}>
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