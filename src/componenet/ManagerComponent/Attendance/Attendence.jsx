import "./Attendence.css";
import React, { useState, useEffect } from "react";

const doctors = [
{
    name: 'Dr. Sarah Johnson',
    Role: "Doctor",
    Specality: 'Orthodontist',
    attendance: {
        "2025-05-01": { status: "Present", checkIn: "10:00", checkOut: "12:00" },
        "2025-05-02": { status: "Absent" },
        "2025-05-03": { status: "Late", checkIn: "11:00", checkOut: "13:00" },
    }
},
{
    name: 'Dr. Michael Chen',
    Role: "Doctor",
    Specality: 'Periodontist',
    attendance: {
        "2025-05-01": { status: "Present", checkIn: "09:00", checkOut: "15:00" },
        "2025-05-02": { status: "Leave" },
        "2025-05-03": { status: "Absent" },
    }
},
{
    name: 'Dr. Emily Williams',
    Role: "Receptionist",
    Specality: 'Senior Receptionist',
    attendance: {
        "2025-05-01": { status: "Present", checkIn: "08:30", checkOut: "16:00" },
    }
},
{
    name: 'Dr. James Wilson',
    Role: "Receptionist",
    Specality: 'Dental Assistant',
    attendance: {
        "2025-05-02": { status: "Late", checkIn: "11:30", checkOut: "17:00" },
    }
},
];

const DocSchedule = () => {
    const [startDay, setStartDay] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [filteredRole, setFilteredRole] = useState([]);
    const [activeRole, setActiveRole] = useState("");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const daysNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

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

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const getDayWithSuffix = (day) => {
        if (day >= 11 && day <= 13) return `${day}th`;
        const lastDigit = day % 10;
        if (lastDigit === 1) return `${day}st`;
        if (lastDigit === 2) return `${day}nd`;
        if (lastDigit === 3) return `${day}rd`;
        return `${day}th`;
    };

    useEffect(() => {
        if (activeRole === "") {
            setFilteredRole(doctors);
        } else {
            const filter = doctors.filter((doc) => doc.Role === activeRole);
            setFilteredRole(filter);
        }
    }, [activeRole]);

    return (
        <div className="docSchdeule">
            <div className="data2">
                <div className="title2">
                    <p>Staff Attendence</p>
                </div>
                <hr id="split" />
            </div>
            
            <div className="body1">
                <div className="smLeft">
                        <strong>Select Date</strong>
                        <p style={{ color: "rgb(5, 5, 107)", opacity: "0.7", fontSize: "12px", marginTop: "-5px" }}>
                            Choose a date to view schedules
                        </p>
                    <div className="calender1">
                        <div className="calendar-header">
                            <button onClick={prevMonth}>&lt;</button>
                            <span>{currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</span>
                            <button onClick={nextMonth}>&gt;</button>
                        </div>

                        <div className="days-name">
                            {daysNames.map((day) => (
                                <div key={day} className="day-name">{day}</div>
                            ))}
                        </div>

                        <div className="days">
                            {Array.from({ length: startDay }).map((_, index) => (
                                <div key={index} className="empty-day"></div>
                            ))}
                            {daysInMonth.map((day) => {
                                const today = new Date();
                                const isToday = day.toDateString() === today.toDateString();
                                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();       
                                return (
                                    <div
                                        key={day}
                                        className={`day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                                        onClick={() => handleDateClick(day)}
                                    > {day.getDate()}
                                    </div>
                            );
                        })}
                        </div>
                    </div>
                </div>

                <div className="lrRight">
                    <h2 className="subtitle">
                        Schedules for: {selectedDate.toLocaleString("default", { month: "long" })} {getDayWithSuffix(selectedDate.getDate())}, {selectedDate.getFullYear()}
                    </h2>
                    <p style={{ color: "rgb(5, 5, 107)", opacity: "0.7", fontSize: "12px", marginTop: "-5px" }}>
                        Staff check-in and check-out details
                    </p>

                    <div className="tabs1">
                        <div className="card1">
                            <table className="staff-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Specality</th>
                                        <th>Status</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map((doc, index) => {
                                        const dateKey = selectedDate.toISOString().split('T')[0];
                                        const attendance = doc.attendance?.[dateKey] || { status: "No Record" };
                                        return (
                                        <tr key={index} className="row">
                                            <td>{doc.name}</td>
                                            <td>{doc.Specality}</td>
                                            <td>
                                                <span className={`record ${attendance.status?.toLowerCase().replace(" ", "-")}`}>
                                                    {attendance.status}
                                                </span>
                                            </td>
                                            <td>{attendance.checkIn || "-"}</td>
                                            <td>{attendance.checkOut || "-"}</td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom">
                <strong className="subtitle">Monthly Attendance Summary</strong>
                    <p style={{ color: "rgb(5, 5, 107)", opacity: "0.7", fontSize: "12px", marginTop: "-5px" }}>
                        Staff attendance statistics for {selectedDate.toLocaleString("default", { month: "long" })}, {selectedDate.getFullYear()}
                </p>

                <div className="staffRole">
                    <button className={activeRole === "Doctor" ? "activebtn" : ""} onClick={() => setActiveRole("Doctor")}>Doctors</button>
                    <button className={activeRole === "Receptionist" ? "activebtn" : ""} onClick={() => setActiveRole("Receptionist")}>Receptionists</button>
                </div>

                <div className="tabs">
                    <div className="card1">
                    <table className="staff-table" style={{ textAlign: "justify" }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Specality</th>
                                <th>Presents</th>
                                <th>Late Days</th>
                                <th>Absent</th>
                                <th>Leave</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRole.map((doc, index) => {
                            const currentMonth = selectedDate.getMonth();
                            const currentYear = selectedDate.getFullYear();

                            let present = 0, late = 0, absent = 0, leave = 0;
                        
                            Object.entries(doc.attendance || {}).forEach(([dateStr, record]) => {
                                const date = new Date(dateStr);
                                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                                switch (record.status) {
                                    case "Present": present++; break;
                                    case "Late": late++; break;
                                    case "Absent": absent++; break;
                                    case "Leave": leave++; break;
                                }}
                            });
                        
                            return (
                                <tr key={index} className="row">
                                    <td>{doc.name}</td>
                                    <td>{doc.Specality}</td>
                                    <td style={{ paddingLeft: "20px" }}>{present}</td>
                                    <td style={{ paddingLeft: "20px" }}>{late}</td>
                                    <td style={{ paddingLeft: "20px" }}>{absent}</td>
                                    <td style={{ paddingLeft: "20px" }}>{leave}</td>
                                </tr>
                            );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </div>
    );
};

export default DocSchedule;