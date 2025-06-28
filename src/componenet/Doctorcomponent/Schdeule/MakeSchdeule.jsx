import "./MakeSchdeule.css";
import React, { useState, useEffect } from "react";

export const MakeSchdeule = () => {
    const [startDay, setStartDay] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [isEditMode, setIsEditMode] = useState(true);
    const [savedSchedule, setSavedSchedule] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const doctorId = localStorage.getItem('doctorId')
    
    
    ; // Replace with actual doctor ID from your auth system

    const timeSlots = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
        "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
        "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "7:00 PM"
    ];

    useEffect(() => {
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

    useEffect(() => {
        const loadSchedule = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5068/api/schedule/available/${doctorId}`);
                if (!response.ok) {
                    throw new Error('Failed to load schedule');
                }
                const data = await response.json();
                
                // Convert API response to frontend format
                const loadedSchedule = {};
                data.forEach(item => {
                    const day = item.dayOfWeek.toString();
                    if (!loadedSchedule[day]) {
                        loadedSchedule[day] = [];
                    }
                    loadedSchedule[day].push(item.timeSlot);
                });
                
                setSchedule(loadedSchedule);
                setSavedSchedule(loadedSchedule);
            } catch (err) {
                setError(err.message);
                console.error('Error loading schedule:', err);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSchedule();
    }, [doctorId]);

    const daysNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const toggleSlot = (slot) => {
        if (!selectedDate || !isEditMode) return;
        const selectedDayName = selectedDate.getDay();

        setSchedule((prev) => {
            const updatedSchedule = { ...prev };
            const key = selectedDayName.toString();

            const updatedSlots = updatedSchedule[key] ? new Set(updatedSchedule[key]) : new Set();
            if (updatedSlots.has(slot)) {
                updatedSlots.delete(slot);
            } else {
                updatedSlots.add(slot);
            }

            updatedSchedule[key] = Array.from(updatedSlots);
            return updatedSchedule;
        });
    };

    const formatDate = (date) => {
        if (!date) return "";
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Convert the schedule state to the format backend expects
            const requestData = [];
            
            for (const [dayOfWeek, slots] of Object.entries(schedule)) {
                slots.forEach(slot => {
                    requestData.push({
                        DoctorId: doctorId,
                        DayOfWeek: parseInt(dayOfWeek),
                        TimeSlot: slot,
                        IsAvailable: true
                    });
                });
            }

            const response = await fetch('http://localhost:5068/api/schedule/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Failed to save schedule');
            }

            setSavedSchedule({...schedule});
            setIsEditMode(false);
        } catch (err) {
            setError(err.message);
            console.error('Error saving schedule:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    return (
        <div className="makeSchedule-container">
            <div className='data2'>
                <div className='title2'>
                    <p>Doctor Schedule</p>
                </div>
            </div>
            <div className="schedule-header">
                <p className="schedule-subtitle">Set your availability for appointments</p>
            </div>
            <hr id="split" />
            
            {isLoading && <div className="loading-message">Loading...</div>}
            {error && <div className="error-message">Error: {error}</div>}
            
            <div className="schedule-content">
                <div className="calendar-section">
                    <div className="month-navigation">
                        <button className="nav-button" onClick={prevMonth}>
                            <span className="nav-arrow">←</span>
                        </button>
                        <h3 className="current-month">
                            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
                        </h3>
                        <button className="nav-button" onClick={nextMonth}>
                            <span className="nav-arrow">→</span>
                        </button>
                    </div>
                    
                    <div className="calendar">
                        <div className="weekdays">
                            {daysNames.map((day) => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        
                        <div className="days-grid">
                            {Array.from({ length: startDay }).map((_, index) => (
                                <div key={`empty-${index}`} className="calendar-day empty"></div>
                            ))}
                            
                            {daysInMonth.map((day) => {
                                const today = new Date();
                                const isToday = day.getDate() === today.getDate() &&
                                    day.getMonth() === today.getMonth() &&
                                    day.getFullYear() === today.getFullYear();
                                
                                const isSelected = selectedDate && 
                                    day.toDateString() === selectedDate.toDateString();
                                
                                // Check if this day has any scheduled slots
                                const scheduleToCheck = isEditMode ? schedule : savedSchedule;
                                const hasSchedule = scheduleToCheck[day.getDay()]?.length > 0;
                                
                                return (
                                    <div
                                        key={day.getTime()}
                                        className={`calendar-day ${isToday ? "today" : ""} 
                                            ${isSelected ? "selected" : ""} 
                                            ${hasSchedule ? "has-schedule" : ""}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        <span>{day.getDate()}</span>
                                        {hasSchedule && <div className="schedule-indicator"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="time-slots-section">
                    <div className="time-slots-header">
                        {selectedDate ? (
                            <>
                                <h3>Available Time Slots</h3>
                                <p className="selected-date">{formatDate(selectedDate)}</p>
                            </>
                        ) : (
                            <p className="no-date-selected">Please select a date to manage time slots</p>
                        )}
                    </div>
                    
                    {selectedDate && (
                        <div className="time-slots-grid">
                            {timeSlots.map((slot, index) => {
                                const scheduleToCheck = isEditMode ? schedule : savedSchedule;
                                const isSelected = scheduleToCheck[selectedDate.getDay()]?.includes(slot);
                                return (
                                    <div
                                        key={index}
                                        className={`time-slot ${isSelected ? "selected-slot" : ""} ${!isEditMode ? "view-mode" : ""}`}
                                        onClick={() => toggleSlot(slot)}
                                    >
                                        <span className="time-text">{slot}</span>
                                        {isSelected && <span className="slot-check">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {selectedDate && (
                        <div className="slot-actions">
                            <p className="slot-helper-text">
                                {isEditMode ? "Click on a time slot to toggle availability" : "Your schedule has been saved"}
                            </p>
                            <p className="selected-count">
                                {(isEditMode ? schedule : savedSchedule)[selectedDate.getDay()]?.length || 0} slots selected
                            </p>
                        </div>
                    )}
                    
                    <div className="schedule-buttons">
                        {isEditMode ? (
                            selectedDate && (
                                <button 
                                    className="submit-btn" 
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Schedule'}
                                </button>
                            )
                        ) : (
                            <button 
                                className="edit-btn" 
                                onClick={handleEdit}
                                disabled={isLoading}
                            >
                                Edit Schedule
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MakeSchdeule;