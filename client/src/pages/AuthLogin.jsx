import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import API_CONFIG from '../config/api.config';
import styles from '../styles/authlogin.module.css';

const AuthLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    if (field === 'email') {
      setErrors({ ...errors, email: validateEmail(email) });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(password) });
    }
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
      console.log("Initiating login request...");
      
      // Determine endpoint based on role
      let endpoint = `${API_CONFIG.BACKEND_URL}/auth/login`;
      if (role === 'admin') {
        endpoint = `${API_CONFIG.BACKEND_URL}/auth/admin/login`;
      } else if (role === 'manager') {
        endpoint = `${API_CONFIG.BACKEND_URL}/auth/manager/login`;
      }
      
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();
      console.log('Login response:', resp, data);
      
      if (data && data.success) {
        // Store email, id, and role in Redux
        dispatch(loginSuccess({ 
          email: data.email, 
          id: data.buyerId,
          role: role
        }));
        
        setMessage('Login successful!');
        
        // Redirect based on role
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/Admin');
          } else if (role === 'manager') {
            navigate('/manager');
          } else {
            navigate('/');
          }
        }, 0);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setMessage('Network error - Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Login to your account</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>Login As</label>
            <select 
              id="role"
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input 
              type="email" 
              id="email"
              className={styles.input}
              placeholder="Enter your email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              required 
            />
            {touched.email && errors.email && (
              <p className={styles.errorText}>⚠ {errors.email}</p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              type="password" 
              id="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              required 
            />
            {touched.password && errors.password && (
              <p className={styles.errorText}>⚠ {errors.password}</p>
            )}
          </div>
          <span>Don't have an account? <a href="#" onClick={(e) =>{e.preventDefault(); navigate('/signup')}} style={{ color: 'blue' }}>Register here</a></span>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {message && (
          <p className={`${styles.message} ${message.includes('successful') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthLogin;
