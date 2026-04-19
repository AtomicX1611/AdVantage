import React, { useState } from 'react';
import API_CONFIG from '../config/api.config';

const BACKEND = (API_CONFIG.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
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
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginPage;