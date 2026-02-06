import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api.config';
import styles from '../styles/auth.module.css';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateOldPassword = (value) => {
    if (!value) return 'Current password is required';
    return '';
  };

  const validateNewPassword = (value) => {
    if (!value) return 'New password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (value === formData.oldPassword) return 'New password must be different from current password';
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== formData.newPassword) return 'Passwords do not match';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      oldPassword: validateOldPassword(formData.oldPassword),
      newPassword: validateNewPassword(formData.newPassword),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (touched[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    if (field === 'oldPassword') {
      setErrors({ ...errors, oldPassword: validateOldPassword(formData.oldPassword) });
    } else if (field === 'newPassword') {
      setErrors({ ...errors, newPassword: validateNewPassword(formData.newPassword) });
    } else if (field === 'confirmPassword') {
      setErrors({ ...errors, confirmPassword: validateConfirmPassword(formData.confirmPassword) });
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
      const resp = await fetch(`${API_CONFIG.BACKEND_URL}/user/update/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await resp.json();
      
      if (data && data.success) {
        setMessage('Password updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setMessage('Network error - Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Update Password</h1>
          <p className={styles.authSubtitle}>Change your account password</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="oldPassword" className={styles.label}>Current Password</label>
            <input 
              type="password" 
              id="oldPassword"
              name="oldPassword"
              className={styles.input}
              placeholder="Enter your current password"
              value={formData.oldPassword} 
              onChange={handleChange}
              onBlur={() => handleBlur('oldPassword')}
              required 
            />
            {touched.oldPassword && errors.oldPassword && (
              <p className={styles.errorText}>⚠ {errors.oldPassword}</p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>New Password</label>
            <input 
              type="password" 
              id="newPassword"
              name="newPassword"
              className={styles.input}
              placeholder="Enter your new password"
              value={formData.newPassword} 
              onChange={handleChange}
              onBlur={() => handleBlur('newPassword')}
              required 
              minLength="8"
            />
            {touched.newPassword && errors.newPassword && (
              <p className={styles.errorText}>⚠ {errors.newPassword}</p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              className={styles.input}
              placeholder="Confirm your new password"
              value={formData.confirmPassword} 
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              required 
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className={styles.errorText}>⚠ {errors.confirmPassword}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        
        {message && (
          <p className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}

        <p className={styles.footerText}>
          <span onClick={() => navigate('/profile')} style={{ cursor: 'pointer', color: '#3b82f6' }}>
            Back to Profile
          </span>
        </p>
      </div>
    </div>
  );
};

export default UpdatePassword;
