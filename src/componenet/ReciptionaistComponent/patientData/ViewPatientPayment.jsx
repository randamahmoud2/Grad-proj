import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Patientoption } from './patientoption'
import { FaMoneyBillWave, FaFileInvoiceDollar, FaFilter } from 'react-icons/fa'
import './ViewPatientPayment.css'

const ViewPatientPayment = () => {
  const { id } = useParams();
  const [payments, setPayments] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`http://localhost:5068/api/patients/${id}/payments`);
        setPayments(response.data);
      } catch (err) {
        setError('Failed to load payment history. Please try again later.');
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [id]);

  const filteredPayments = payments.filter(payment => {
    if (filterStatus === 'all') return true;
    return payment.status === filterStatus;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getStatusBadgeClass = (status) => {
    return status === 'paid' ? 'status-badge paid' : 'status-badge pending';
  };

  if (loading) return <div className="loading">Loading payment history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className='patientdata1'>
      <Patientoption/>
      <div className='data2'>
        <div className='title2'>
          <p>Patient Payment History</p>
        </div>
        <hr id="split" />

        <div className="payment-container">
          <div className="filter-section">
            <button 
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filter Payments
            </button>
            
            {showFilters && (
              <div className="filter-options">
                <button 
                  className={filterStatus === 'all' ? 'active' : ''}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button 
                  className={filterStatus === 'paid' ? 'active' : ''}
                  onClick={() => setFilterStatus('paid')}
                >
                  Paid
                </button>
                <button 
                  className={filterStatus === 'pending' ? 'active' : ''}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </button>
              </div>
            )}
          </div>

          <div className="summary-cards">
            <div className="summary-card total">
              <h3>Total Amount</h3>
              <p className="amount">{totalAmount.toLocaleString()} EGP</p>
            </div>
            <div className="summary-card pending">
              <h3>Pending Amount</h3>
              <p className="amount">{pendingAmount.toLocaleString()} EGP</p>
            </div>
          </div>

          <div className="payments-list">
            {filteredPayments.length === 0 ? (
              <div className="no-payments">No payment records found.</div>
            ) : (
              filteredPayments.map(payment => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-type">
                      {payment.type === 'consultation' ? <FaMoneyBillWave /> : <FaFileInvoiceDollar />}
                      <span>{payment.type === 'consultation' ? 'Consultation' : 'Procedure'}</span>
                    </div>
                    <div className="payment-details">
                      <h4>{payment.name}</h4>
                      <p className="doctor">Doctor: {payment.doctor}</p>
                      <p className="date">Date: {new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="payment-amount">
                    <p className="amount">{payment.amount.toLocaleString()} EGP</p>
                    <span className={getStatusBadgeClass(payment.status)}>
                      {payment.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewPatientPayment;
