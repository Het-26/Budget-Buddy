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
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h1>Welcome to Budget Buddy!</h1>
      <p>Hello, {username}! You are successfully logged in.</p>
      
      <div style={{ marginTop: 20 }}>
        <h2>Your Dashboard</h2>
        <p>This is your home page where you can manage your budget.</p>
        
        <div style={{ marginTop: 20 }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ff4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
