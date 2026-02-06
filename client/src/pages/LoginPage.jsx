import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const resp = await fetch('http://localhost:3000/auth/login', {
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
