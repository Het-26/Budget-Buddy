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
    <div className="container-fluid" style={{ minHeight: '100vh' }}>
      <div className="row">
        {/* Left Vertical Navigation Bar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-primary sidebar py-4 min-vh-100">
          <div className="position-sticky d-flex flex-column align-items-center">
            <h2 className="text-white mt-5 mb-5">Budget Buddy</h2>
            <button className="btn btn-light w-75 mb-3 text-primary fw-bold text-start">Add Expense</button>
            <button className="btn btn-light w-75 mb-3 text-primary fw-bold text-start">Expense History</button>
            <button className="btn btn-light w-75 mb-3 text-primary fw-bold text-start">Budget</button>
          </div>
        </nav>
        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: 800 }}>
            <div className="card shadow-sm p-4">
              <h1 className="mb-3">Welcome to Budget Buddy!</h1>
              <p className="mb-4">Hello, {username}! You are successfully logged in.</p>
              <div className="mb-4">
                <h2>Your Dashboard</h2>
                <p>This is your home page where you can manage your budget.</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
