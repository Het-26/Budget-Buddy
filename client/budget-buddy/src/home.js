import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    
    if (!token) {
      navigate('/');
      return;
    }
    
    setUsername(storedUsername);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Left Vertical Navigation Bar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-primary sidebar collapse" style={{ minHeight: '100vh' }}>
          <div className="position-sticky pt-3">
            <div className="text-center mb-4">
              <h2 className="text-white">Budget Buddy</h2>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <button 
                  className="btn btn-light w-100 text-start"
                  onClick={() => navigate('/add-expense')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Expense
                </button>
              </li>
              <li className="nav-item mb-2">
                <button className="btn btn-light w-100 text-start">
                  <i className="bi bi-clock-history me-2"></i>
                  Expense History
                </button>
              </li>
              <li className="nav-item mb-2">
                <button className="btn btn-light w-100 text-start">
                  <i className="bi bi-pie-chart me-2"></i>
                  Budget
                </button>
              </li>
            </ul>
          </div>
        </nav>

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

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Welcome to Budget Buddy!</h5>
                  <p className="card-text">Hello, <strong>{username}</strong>! You are successfully logged in.</p>
                  <p className="card-text">This is your home page where you can manage your budget.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Expenses</h5>
                  <p className="card-text display-6 text-primary">$0</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Monthly Budget</h5>
                  <p className="card-text display-6 text-success">$0</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Remaining</h5>
                  <p className="card-text display-6 text-info">$0</p>
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
