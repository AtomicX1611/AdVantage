import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api.config';

const BACKEND = (API_CONFIG.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      console.log("Initiating request : ");  
      const resp = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({email, password }),
      });

      const data = await resp.json();
      console.log('signup response:', resp, data);
      if (data && data.success) {
        setMessage('Login successful — check browser cookies for token');
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setMessage('Network error');
    }
  };

  return (
    <div>
      <h2>LoginPage (Login test)</h2>
      <button onClick={() => navigate('/auth/login')} style={{ marginBottom: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Go to Login Page</button>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">Email:</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="login-password">Password:</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginPage;
