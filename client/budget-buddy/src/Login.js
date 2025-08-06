import React, { useState, useEffect } from 'react';
import api from './axiosConfig';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/home';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('login/', {
        username,
        password
      });
      
      if (response.data.success && response.data.token) {
        // Store JWT token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', username);
        setMessage('Login successful! Redirecting...');
        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = '/home';
        }, 1000);
      } else {
        setMessage(response.data.message);
      }
      
    } catch (error) {
      setMessage('Error connecting to server: ' + error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setMessage('Logged out successfully!');
    setUsername('');
    setPassword('');
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && <div style={{ marginTop: 20, color: message.includes('successful') ? 'green' : 'red' }}>{message}</div>}
      {localStorage.getItem('token') && (
        <button onClick={handleLogout} style={{ width: '100%', padding: 10, marginTop: 10, backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: 4 }}>
          Logout
        </button>
      )}
    </div>
  );
}

export default Login; 