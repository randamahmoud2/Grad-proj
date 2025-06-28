import React, { useState } from 'react';
import './Finance.css';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  // Sample data
  const financeData = {
    month: {
      totalRevenue: 45000,
      totalExpenses: 28000,
      profit: 17000,
      appointmentsCount: 120,
      avgRevenuePerAppointment: 375,
      revenueByService: [
        { name: 'Dental Cleaning', value: 12000 },
        { name: 'Tooth Extraction', value: 8500 },
        { name: 'Root Canal', value: 15000 },
        { name: 'Braces', value: 9500 }
      ],
      recentTransactions: [
        { id: 1, patient: 'John Doe', service: 'Dental Cleaning', amount: 150, date: '2023-11-20' },
        { id: 2, patient: 'Jane Smith', service: 'Root Canal', amount: 900, date: '2023-11-19' },
        { id: 3, patient: 'Mike Johnson', service: 'Tooth Extraction', amount: 250, date: '2023-11-18' },
        { id: 4, patient: 'Sarah Williams', service: 'Braces', amount: 1200, date: '2023-11-17' },
        { id: 5, patient: 'David Brown', service: 'Dental Cleaning', amount: 150, date: '2023-11-16' }
      ]
    },
    quarter: {
      totalRevenue: 135000,
      totalExpenses: 85000,
      profit: 50000,
      appointmentsCount: 350,
      avgRevenuePerAppointment: 385,
      revenueByService: [
        { name: 'Dental Cleaning', value: 35000 },
        { name: 'Tooth Extraction', value: 25000 },
        { name: 'Root Canal', value: 48000 },
        { name: 'Braces', value: 27000 }
      ],
      recentTransactions: [
        { id: 1, patient: 'John Doe', service: 'Dental Cleaning', amount: 150, date: '2023-11-20' },
        { id: 2, patient: 'Jane Smith', service: 'Root Canal', amount: 900, date: '2023-11-19' },
        { id: 3, patient: 'Mike Johnson', service: 'Tooth Extraction', amount: 250, date: '2023-11-18' },
        { id: 4, patient: 'Sarah Williams', service: 'Braces', amount: 1200, date: '2023-11-17' },
        { id: 5, patient: 'David Brown', service: 'Dental Cleaning', amount: 150, date: '2023-11-16' }
      ]
    },
    year: {
      totalRevenue: 540000,
      totalExpenses: 320000,
      profit: 220000,
      appointmentsCount: 1400,
      avgRevenuePerAppointment: 385,
      revenueByService: [
        { name: 'Dental Cleaning', value: 140000 },
        { name: 'Tooth Extraction', value: 100000 },
        { name: 'Root Canal', value: 180000 },
        { name: 'Braces', value: 120000 }
      ],
      recentTransactions: [
        { id: 1, patient: 'John Doe', service: 'Dental Cleaning', amount: 150, date: '2023-11-20' },
        { id: 2, patient: 'Jane Smith', service: 'Root Canal', amount: 900, date: '2023-11-19' },
        { id: 3, patient: 'Mike Johnson', service: 'Tooth Extraction', amount: 250, date: '2023-11-18' },
        { id: 4, patient: 'Sarah Williams', service: 'Braces', amount: 1200, date: '2023-11-17' },
        { id: 5, patient: 'David Brown', service: 'Dental Cleaning', amount: 150, date: '2023-11-16' }
      ]
    }
  };

  const currentData = financeData[dateRange];

  // Calculate percentages for service revenue chart
  const totalServiceRevenue = currentData.revenueByService.reduce((sum, service) => sum + service.value, 0);
  
  // Format currency 
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="dashboard1">
      <div className="data2">
        <div className='title2'>
          <p>Finance</p>
        </div>
        <hr id="split" />
      </div>

      <div className="details">
        <div className="date-selector">
          <button 
            className={dateRange === 'month' ? 'active' : ''} 
            onClick={() => setDateRange('month')}
          >
            This Month
          </button>
          <button 
            className={dateRange === 'quarter' ? 'active' : ''} 
            onClick={() => setDateRange('quarter')}
          >
            This Quarter
          </button>
          <button 
            className={dateRange === 'year' ? 'active' : ''} 
            onClick={() => setDateRange('year')}
          >
            This Year
          </button>
        </div>

        <nav className="finance-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''} 
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={activeTab === 'services' ? 'active' : ''} 
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
        </nav>

        {activeTab === 'overview' && (
          <div className="finance-overview">
            <div className="stats-grid">
              <div className="stat-card revenue">
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatCurrency(currentData.totalRevenue)}</p>
                <p className="stat-description">Total earnings for this period</p>
              </div>
              <div className="stat-card expenses">
                <h3>Total Expenses</h3>
                <p className="stat-value">{formatCurrency(currentData.totalExpenses)}</p>
                <p className="stat-description">Total costs for this period</p>
              </div>
              <div className="stat-card profit">
                <h3>Net Profit</h3>
                <p className="stat-value">{formatCurrency(currentData.profit)}</p>
                <p className="stat-description">Revenue minus expenses</p>
              </div>
              <div className="stat-card appointments">
                <h3>Appointments</h3>
                <p className="stat-value">{currentData.appointmentsCount}</p>
                <p className="stat-description">Total appointments for this period</p>
              </div>
            </div>

            <div className="chart-section">
              <h3>Revenue by Service</h3>
              <div className="bar-chart-container">
                <div className="simple-bar-chart">
                  {currentData.revenueByService.map((service, index) => (
                    <div className="chart-item" key={index}>
                      <div className="chart-label">{service.name}</div>
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar"
                          style={{ width: `${(service.value / totalServiceRevenue) * 100}%` }}
                        ></div>
                        <div className="chart-value">{formatCurrency(service.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="stat-box">
                <h3>Avg. Revenue per Appointment</h3>
                <p className="stat-value">{formatCurrency(currentData.avgRevenuePerAppointment)}</p>
              </div>
              <div className="stat-box">
                <h3>Profit Margin</h3>
                <p className="stat-value">{Math.round((currentData.profit / currentData.totalRevenue) * 100)}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-section">
            <h2>Recent Transactions</h2>
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.patient}</td>
                      <td>{transaction.service}</td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            <h2>Revenue by Service</h2>
            <div className="services-grid">
              {currentData.revenueByService.map((service, index) => (
                <div className="service-card" key={index}>
                  <h3>{service.name}</h3>
                  <p className="service-value">{formatCurrency(service.value)}</p>
                  <p className="service-percentage">
                    {Math.round((service.value / totalServiceRevenue) * 100)}% of revenue
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance; 