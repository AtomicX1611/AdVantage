import React, { useState } from "react";
import styles from "../../styles/admin.module.css";
import API_CONFIG from "../../config/api.config";

export default function UserList({ users, onUserRemoved }) {
  const [loading, setLoading] = useState({});

  const getSubscriptionLabel = (subscription) => {
    if (Array.isArray(subscription) && subscription.length > 0) {
      const first = subscription[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (first && typeof first === 'object' && first.type) return first.type;
    }

    if (subscription && typeof subscription === 'object' && subscription.type) {
      return subscription.type;
    }

    const level = Number(subscription);
    if (Number.isNaN(level) || level <= 0) return null;
    if (level === 1) return 'VIP';
    if (level === 2) return 'Premium';
    return `Plan ${level}`;
  };

  const handleTakeDown = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to remove user "${username}"?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const url = `${API_CONFIG.BACKEND_URL}/admin/remove/${userId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        alert(`User "${username}" has been removed successfully`);
        if (onUserRemoved) {
          onUserRemoved(userId);
        }
      } else {
        alert(data.message || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Error removing user');
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className={styles.userListBox}>
        <h3>All Users</h3>
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No users found
        </p>
      </div>
    );
  }

  return (
    <div className={styles.userListBox}>
      <h3>All Users ({users.length})</h3>
      <div className={styles.userListContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Revenue (₹)</th>
              <th>Subscription</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username || 'N/A'}</td>
                <td>{user.email}</td>
                <td>{user.contact || 'N/A'}</td>
                <td>
                  ₹{(user.earnings || 0).toLocaleString('en-IN')}
                </td>
                <td>
                  {getSubscriptionLabel(user.subscription) ? (
                    <span className={styles.subscriptionBadge}>
                      {getSubscriptionLabel(user.subscription)}
                    </span>
                  ) : (
                    <span className={styles.noSubscription}>None</span>
                  )}
                </td>
                <td>
                  <button
                    className={styles.takeDownBtn}
                    onClick={() => handleTakeDown(user._id, user.username || user.email)}
                    disabled={loading[user._id]}
                  >
                    {loading[user._id] ? 'Removing...' : 'Take Down'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}