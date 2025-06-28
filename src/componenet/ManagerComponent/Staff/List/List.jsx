import './List.css';
import React, { useState, useEffect } from 'react';
import group from '../../../../image/group-chat.png';
import search from '../../../../image/loupe.png';

const StaffList = () => {
    const [staffData, setStaffData] = useState([]);
    const [totalActive, setTotalActive] = useState(0);
    const [activeDoc, setActiveDoc] = useState(0);
    const [activeRes, setActiveRes] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch('http://localhost:5068/api/Staff');
                if (!response.ok) {
                    throw new Error(`Failed to fetch staff: ${response.status}`);
                }
                const data = await response.json();
                console.log('API Response:', data); // Debug: Log the response
                setStaffData(data);
                const activeStaff = data.filter(staff => staff.status === 'Active');
                setTotalActive(activeStaff.length);
                setActiveDoc(activeStaff.filter(staff => staff.role.toLowerCase() === 'doctor').length);
                setActiveRes(activeStaff.filter(staff => staff.role.toLowerCase() === 'receptionist').length);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching staff:', err.message);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const remove = async (id) => {
        try {
            const response = await fetch(`http://localhost:5068/api/Staff/${id}/deactivate`, {
                method: 'PUT',
            });
            if (!response.ok) throw new Error('Failed to deactivate staff');
            setStaffData(prev =>
                prev.map(s => (s.id === id ? { ...s, status: 'Inactive', action: 'Remove' } : s))
            );
            const staff = staffData.find(s => s.id === id);
            if (staff && staff.status === 'Active') {
                setTotalActive(prev => prev - 1);
                if (staff.role.toLowerCase() === 'doctor') setActiveDoc(prev => prev - 1);
                if (staff.role.toLowerCase() === 'receptionist') setActiveRes(prev => prev - 1);
            }
        } catch (err) {
            console.error('Error deactivating staff:', err.message);
            setError(err.message);
        }
    };

    const filteredStaff = staffData.filter(staff => {
        const matchesSearch =
            staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === '' || staff.role.toLowerCase() === filterRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    return (
        <div className="container1">
            <div className="data2">
                <div className="title2">
                    <p>Staff List</p>
                </div>
                <hr id="split" />
            </div>

            <div className="docInfo">
                {[
                    { label: 'Total Active Staff', count: totalActive },
                    { label: 'Doctors', count: activeDoc },
                    { label: 'Receptionists', count: activeRes },
                ].map((item, idx) => (
                    <div className="Info1" key={idx}>
                        <img src={group} alt="Group" style={{ width: '50px' }} />
                        <div>
                            <p style={{ color: 'rgba(3, 3, 76, 0.6)' }}>{item.label}</p>
                            <p>{loading ? 'Loading...' : error ? 'Error' : item.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="search1">
                <div>
                    <img src={search} alt="Search" style={{ width: '20px' }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    name="Roles"
                    id="Role"
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="doctor">Doctors Only</option>
                    <option value="receptionist">Receptionists Only</option>
                </select>
            </div>

            <table className="staff-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody className="tbody">
                    {loading ? (
                        <tr>
                            <td colSpan="6">Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="6">Error: {error}</td>
                        </tr>
                    ) : filteredStaff.length === 0 ? (
                        <tr>
                            <td colSpan="6">No staff found</td>
                        </tr>
                    ) : (
                        filteredStaff.map(staff => (
                            <tr key={staff.id} className="row">
                                <td>{staff.name}</td>
                                <td>
                                    <span className={`role-badge ${staff.role.toLowerCase()}`}>
                                        {staff.role}
                                    </span>
                                </td>
                                <td>{staff.email}</td>
                                <td>{staff.joined}</td>
                                <td>
                                    <span className={`status-badge ${staff.status.toLowerCase()}`}>
                                        {staff.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="rm-btn" onClick={() => remove(staff.id)}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StaffList;