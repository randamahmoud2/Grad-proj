import React, { useEffect, useState } from 'react';
import "./Finance.css";

const Finance = () => {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const patientId = localStorage.getItem('patientId');
                
                if (!patientId) {
                    throw new Error('Patient ID not found. Please log in.');
                }

                const response = await fetch(`http://localhost:5068/api/Payment/patient/${patientId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }

                const data = await response.json();
                setPayments(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching bookings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // حساب المجاميع
    const totalPaid = payments
        .filter(item => item.status.toLowerCase() === 'paid')
        .reduce((acc, item) => acc + item.amount, 0);

    const totalPending = payments
        .filter(item => item.status.toLowerCase() === 'pending')
        .reduce((acc, item) => acc + item.amount, 0);

    const total = totalPaid + totalPending;

    if (isLoading) {
        return <div className="loading">Loading bookings...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="finance-container">
            <div className="data2">
                <div className='title2'>
                    <p>My Bookings</p>
                </div>
                <hr id='split'/>
            </div>
            
            <div className="finance-summary">
                <div className="summary-card paid">Paid: <span>{totalPaid.toFixed(2)} EGP</span></div>
                <div className="summary-card pending">Pending: <span>{totalPending.toFixed(2)} EGP</span></div>
                <div className="summary-card total">Total: <span>{total.toFixed(2)} EGP</span></div>
            </div>
            
            <div className="finance-table-responsive">
                <table className="finance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Procedure</th>
                            <th>Doctor</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: 'rgba(70, 70, 70, 0.63)' }}>
                                    You have no bookings yet.
                                </td>
                            </tr>
                        ) : (
                            payments.map(item => (
                                <tr key={item.id}>
                                    <td>{item.date}</td>
                                    <td>{item.procedure}</td>
                                    <td>{item.doctor}</td>
                                    <td>{item.amount.toFixed(2)} EGP</td>
                                    <td>
                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Finance;