import React, { useState } from 'react';
import api from './axiosConfig';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('signup/', {
        username,
        password
      });
      if (response.data.success) {
        setMessage('Sign up successful! Redirecting to login...');
        setUsername('');
        setPassword('');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setMessage(response.data.message || 'Failed to sign up');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Sign Up</h2>
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
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, backgroundColor: '#28a745', border: 'none', color: 'white', borderRadius: 4 }}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <button
        type="button"
        onClick={() => window.location.href = '/'}
        style={{ width: '100%', padding: 10, marginTop: 10, backgroundColor: '#007bff', border: 'none', color: 'white', borderRadius: 4 }}
        >
          Login
        </button>
      </form>
      {message && <div style={{ marginTop: 20, color: message.includes('successful') ? 'green' : 'red' }}>{message}</div>}
    </div>
  );
}

export default SignUp; 