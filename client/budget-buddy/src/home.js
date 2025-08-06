import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Home() {
  const [username, setUsername] = useState('');
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token) {
      navigate('/');
      return;
    }
    setUsername(storedUsername);
    fetchExpenses(token);
    // eslint-disable-next-line
  }, [navigate]);

  const fetchExpenses = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/expenses/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        calculateLastMonthTotal(data.expenses);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const calculateLastMonthTotal = (expenses) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    let lastMonthSum = 0;
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getFullYear() === lastMonthYear && expDate.getMonth() === lastMonth) {
        lastMonthSum += parseFloat(exp.amount);
      }
    });
    setLastMonthTotal(lastMonthSum);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Navbar active="dashboard" />
        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button 
                  onClick={handleLogout} 
                  className="btn btn-danger"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 800, padding: 0 }}>
            <div className="row g-4 justify-content-center mt-5">
              <div className="col-md-6">
                <div className="card shadow-sm border-0 text-center h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-2">Last Month's Expenses</h5>
                    <p className="card-text display-6 fw-bold text-secondary mb-0">${lastMonthTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
