import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import API_CONFIG from '../config/api.config';
import styles from '../styles/authsignup.module.css';

const AuthSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateUsername = (value) => {
    if (!value.trim()) return 'Username is required';
    if (/^\d/.test(value)) return 'Username cannot start with a number';
    if (value.length < 3) return 'Username must be at least 3 characters';
    return '';
  };

  const validateContact = (value) => {
    if (!value.trim()) return 'Contact number is required';
    if (!/^\d{10}$/.test(value)) return 'Contact must be exactly 10 digits';
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      username: validateUsername(username),
      contact: validateContact(contact),
      email: validateEmail(email),
      password: validatePassword(password)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});

    if (!validateForm()) {
      setMessage('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      console.log("Initiating signup request...");
      
      const resp = await fetch(`${API_CONFIG.BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, contact, email, password }),
      });

      const data = await resp.json();
      console.log('Signup response:', resp, data);
      
      if (data && data.success) {
        // Store both email and id in Redux
        dispatch(loginSuccess({ 
          email: data.email, 
          id: data.buyerId 
        }));
        
        setMessage('Signup successful!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setMessage('Network error - Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join us today and start your journey</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input 
                type="text" 
                id="username"
                className={styles.input}
                placeholder="Your username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              {errors.username && (
                <p className={styles.errorText}>⚠ {errors.username}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="contact" className={styles.label}>Contact</label>
              <input 
                type="text" 
                id="contact"
                className={styles.input}
                placeholder="1234567890"
                value={contact} 
                onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))} 
                maxLength="10"
                required 
              />
              {errors.contact && (
                <p className={styles.errorText}>⚠ {errors.contact}</p>
              )}
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              type="email" 
              id="email"
              className={styles.input}
              placeholder="your.email@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            {errors.email && (
              <p className={styles.errorText}>⚠ {errors.email}</p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              type="password" 
              id="password"
              className={styles.input}
              placeholder="Create a strong password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="8"
            />
            {errors.password && (
              <p className={styles.errorText}>⚠ {errors.password}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        {message && (
          <p className={`${styles.message} ${message.includes('successful') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}

        <p className={styles.linkText}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default AuthSignup;
