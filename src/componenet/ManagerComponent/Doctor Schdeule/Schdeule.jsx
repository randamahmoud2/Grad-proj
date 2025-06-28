import React, { useState, useEffect } from 'react';
import './Scdeule.css'; // تأكدي إن الملف موجود

// DoctorSchedule component to display a doctor's schedule
const DoctorSchedule = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [startDay, setStartDay] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date('2025-06-01')); // بداية يونيو 2025
  const [selectedDate, setSelectedDate] = useState(new Date('2025-06-18')); // افتراضي 18 يونيو 2025
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState(null);

  const daysNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Fetch doctors and set up calendar
  useEffect(() => {
    console.log('Fetching doctors...');
    fetch('http://localhost:5068/api/Doctors')
      .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch doctors: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Doctors fetched:', data);
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0]); // Select first doctor by default
        } else {
          setError('No doctors found');
        }
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again.');
      });

    // Set up calendar days
    const days = [];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const date = new Date(year, month, 1);

    while (date.getMonth() === month) {
      days.push(new Date(date.getTime()));
      date.setDate(date.getDate() + 1);
    }

    setDaysInMonth(days);
    setStartDay(new Date(year, month, 1).getDay());
  }, [currentDate]);

  // Fetch appointments for selected doctor
  useEffect(() => {
    if (selectedDoctor && selectedDoctor.id) {
      console.log(`Fetching appointments for doctor ID: ${selectedDoctor.id}`);
      fetch(`http://localhost:5068/api/Manager/appointments/${selectedDoctor.id}`)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to fetch appointments: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('Appointments fetched:', data);
          setAppointments(data);
        })
        .catch(error => {
          console.error('Error fetching appointments:', error);
          setError('Failed to load appointments. Please try again.');
        });
    }
  }, [selectedDoctor]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Handle doctor selection
  const handleDoctorChange = (e) => {
    const doctor = doctors.find(doc => doc.name === e.target.value);
    if (doctor) {
      setSelectedDoctor(doctor);
      setError(null);
    }
  };

  // Add suffix to day (e.g., 1st, 2nd, 3rd, 4th)
  const getDayWithSuffix = (day) => {
    if (day >= 11 && day <= 13) return `${day}th`;
    const lastDigit = day % 10;
    if (lastDigit === 1) return `${day}st`;
    if (lastDigit === 2) return `${day}nd`;
    if (lastDigit === 3) return `${day}rd`;
    return `${day}th`;
  };

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.appointmentDate);
    return selectedDate && apptDate.toDateString() === selectedDate.toDateString();
  });

  // If there's an error, display it
  if (error) {
    return (
      <div className="docSchedule">
        <div className="data2">
          <div className="title2">
            <p>View Doctors Schedule</p>
          </div>
          <hr id="split" />
        </div>
        <div className="error-message" style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="docSchdeule">
      <div className="data2">
        <div className="title2">
          <p>View Doctors Schedule</p>
        </div>
        <hr id="split" />
      </div>

      <div className="body1">
        {/* Calendar Section */}
        <div className="smLeft">
          <strong>Select Date</strong>
          <p style={{ color: 'rgb(5, 5, 107)', opacity: '0.7', fontSize: '12px', marginTop: '-5px' }}>
            Choose a date to view schedules
          </p>
          <div className="calender1">
            <div className="calendar-header">
              <button onClick={prevMonth}>&lt;</button>
              <span>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
              <button onClick={nextMonth}>&gt;</button>
            </div>

            <div className="days-name">
              {daysNames.map(day => (
                <div key={day} className="day-name">{day}</div>
              ))}
            </div>

            <div className="days">
              {Array.from({ length: startDay }).map((_, index) => (
                <div key={index} className="empty-day"></div>
              ))}
              {daysInMonth.map(day => {
                const today = new Date('2025-06-28'); // التاريخ الحالي
                const isToday = day.toDateString() === today.toDateString();
                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={day}
                    className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="lrRight">
          <h2 className="subtitle">
            Schedules for: {selectedDate.toLocaleString('default', { month: 'long' })} {getDayWithSuffix(selectedDate.getDate())}, {selectedDate.getFullYear()}
          </h2>
          <p style={{ color: 'rgb(5, 5, 107)', opacity: '0.7', fontSize: '12px', marginTop: '-5px' }}>
            Doctor appointments and procedures
          </p>

          <div>
            <select
              value={selectedDoctor?.name || ''}
              onChange={handleDoctorChange}
              className="docattend"
            >
              {doctors.length > 0 ? (
                doctors.map(doc => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name}
                  </option>
                ))
              ) : (
                <option value="">No doctors available</option>
              )}
            </select>
          </div>

          <div className="tabs">
            <div className="card1">
              <h3 className="subtitle" style={{ color: '#2f6fc8', marginLeft: '10px' }}>
                {selectedDoctor?.name || 'No Doctor Selected'}
              </h3>
              <p style={{ color: 'rgb(5, 5, 107)', opacity: '0.7', marginTop: '-5px' }}>
                {selectedDoctor?.specialty || 'No Specialty'}
              </p>
              <hr style={{ border: '1px solid rgba(7, 7, 143, 0.21)', margin: '10px 0 20px 10px' }} />
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Procedure</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appt, index) => (
                      <tr key={appt.id || index} className="row">
                        <td>{appt.timeSlot || 'N/A'}</td>
                        <td>{appt.patient?.name || 'Unknown'}</td>
                        <td>{appt.procedure || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No appointments for this date</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;