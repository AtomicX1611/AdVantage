import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import styles from "../styles/admin.module.css";
import API_CONFIG from "../config/api.config";

import AdminSidebar from "../components/Admin/AdminSidebar";
import StatsRow from "../components/Admin/StatsRow";
import ChartsRow from "../components/Admin/AdminChartsRow.jsx";
import AdminRecentActivity from "../components/Admin/AdminRecentActivity";
import PaymentAnalytics from "../components/Admin/PaymentAnalytics";
import UserList from "../components/Admin/UserList";
import ManagerList from "../components/Admin/ManagerList";

export default function AdminPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_CONFIG.BACKEND_URL}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        dispatch(logout());
        navigate('/login');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (err) {
      console.error('Logout Error:', err);
      alert('Logout failed. Please try again.');
    }
  };

  const [stats, setStats] = useState([
    { title: "Total Users", value: "...", icon: "bx bxs-group", colorClass: "metricIconBlue" },
    { title: "Active Users", value: "...", icon: "bx bxs-user-check", colorClass: "metricIconGreen" },
    { title: "Total Products", value: "...", icon: "bx bx-package", colorClass: "metricIconPurple" },
    { title: "Revenue (₹)", value: "...", icon: "bx bxs-wallet", colorClass: "metricIconAmber" },
  ]);

  const [pieData, setPieData] = useState({
    users: [0, 0, 0],
    subscriptions: [0, 0, 0]
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  const [allManagers, setAllManagers] = useState([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendURL = API_CONFIG.BACKEND_URL;

  // Fetch all raw data from the existing endpoint
  const fetchAllData = useCallback(async () => {
    try {
      const url = `${backendURL}/${API_CONFIG.API_ENDPOINTS.ADMIN_USERS}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      if (responseData.success && responseData.data && responseData.counts) {
        const { data, counts } = responseData;

        // Store raw data for list tabs
        setAllUsers(data.users);
        setAllManagers(data.managers || []);

        // Pie data for charts
        setPieData({
          users: [counts.admins || 0, counts.managers || 0, counts.users || 0],
          subscriptions: [
            data.users.filter(u => u.subscription === 0 || u.subscription == null).length,
            data.users.filter(u => u.subscription === 1).length,
            data.users.filter(u => u.subscription === 2).length
          ]
        });
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to fetch admin data");
    }
  }, [backendURL]);

  // Fetch computed metrics from the new endpoint
  const fetchMetrics = useCallback(async () => {
    try {
      const url = `${backendURL}/${API_CONFIG.API_ENDPOINTS.ADMIN_METRICS}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.metrics) {
        const m = data.metrics;

        setStats([
          { title: "Total Users", value: m.totalUsers || 0, icon: "bx bxs-group", colorClass: "metricIconBlue" },
          { title: "Active Users", value: m.activeUsers || 0, icon: "bx bxs-user-check", colorClass: "metricIconGreen" },
          { title: "Total Products", value: m.totalProducts || 0, icon: "bx bx-package", colorClass: "metricIconPurple" },
          { title: "Revenue (₹)", value: (m.totalRevenue || 0).toLocaleString('en-IN'), icon: "bx bxs-wallet", colorClass: "metricIconAmber" },
        ]);

        setRecentActivity(m.recentActivity || []);
        setCategoryProductCounts(m.categoryProductCounts || []);
        setCategoryRevenue(m.revenueByCategory || []);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      // Non-critical — overview stats will show defaults
    }
  }, [backendURL]);

  // Fetch payment analytics data
  const fetchPaymentAnalytics = useCallback(async () => {
    try {
      const url = `${backendURL}/${API_CONFIG.API_ENDPOINTS.ADMIN_PAYMENT_ANALYTICS}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment analytics: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.analytics) {
        setPaymentAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Error fetching payment analytics:", err);
      // Non-critical — payments tab will show basic history
    }
  }, [backendURL]);

  // Handle user removal
  const handleUserRemoved = (userId) => {
    setAllUsers(prevUsers => prevUsers.filter(u => u._id !== userId));

    setStats(prevStats => {
      const newStats = [...prevStats];
      const idx = newStats.findIndex(s => s.title === "Total Users");
      if (idx !== -1) {
        const currentValue = parseInt(newStats[idx].value);
        newStats[idx] = { ...newStats[idx], value: currentValue - 1 };
      }
      return newStats;
    });

    setPieData(prevPieData => ({
      ...prevPieData,
      users: [
        prevPieData.users[0],
        prevPieData.users[1],
        Math.max(0, prevPieData.users[2] - 1)
      ]
    }));
  };

  const handleManagerAdded = (manager) => {
    // Update manager count in pie data
    setPieData(prevPieData => ({
      ...prevPieData,
      users: [
        prevPieData.users[0],
        prevPieData.users[1] + 1,
        prevPieData.users[2]
      ]
    }));
    // Add new manager to the list
    setAllManagers(prevManagers => [...prevManagers, manager]);
  };
  // Handle manager removal
  const handleManagerRemoved = (managerId) => {
    setAllManagers(prevManagers => prevManagers.filter(m => m._id !== managerId));

    setPieData(prevPieData => ({
      ...prevPieData,
      users: [
        prevPieData.users[0],
        Math.max(0, prevPieData.users[1] - 1),
        prevPieData.users[2]
      ]
    }));
  };


  // Fetch all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAllData(), fetchMetrics(), fetchPaymentAnalytics()]);
      } catch (err) {
        console.error("Error loading admin data:", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [fetchAllData, fetchMetrics, fetchPaymentAnalytics]);

  const tabTitles = {
    overview: 'Dashboard Overview',
    users: 'User Management',
    managers: 'Manager Management',
    payments: 'Payment Analytics',
  };

  const tabSubtitles = {
    overview: 'Monitor your platform at a glance',
    users: 'View and manage platform users',
    managers: 'View and manage platform managers',
    payments: 'Revenue analytics, category insights, and transaction details',
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchAllData(), fetchMetrics(), fetchPaymentAnalytics()])
      .finally(() => setLoading(false));
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerGreeting}>
              <i className='bx bxs-hand-right'></i>
              Welcome, Admin
            </span>
            <h1 className={styles.pageTitle}>{tabTitles[activeTab]}</h1>
            <p className={styles.pageSubtitle}>{tabSubtitles[activeTab]}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerDate}>
              <i className='bx bx-calendar'></i>
              {getCurrentDate()}
            </div>
            <button className={styles.headerRefreshBtn} onClick={handleRefresh} title="Refresh data">
              <i className='bx bx-refresh'></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <p className={styles.errorHint}>
              Make sure the backend server is running on {backendURL}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className={styles.tabContent}>
                <StatsRow stats={stats} />
                <ChartsRow
                  pieData={pieData}
                  categoryProductCounts={categoryProductCounts}
                  revenueByCategory={categoryRevenue}
                />
                <AdminRecentActivity activity={recentActivity} />
              </div>
            )}

            {activeTab === 'users' && (
              <div className={styles.tabContent}>
                <UserList users={allUsers} onUserRemoved={handleUserRemoved} />
              </div>
            )}

            {activeTab === 'managers' && (
              <div className={styles.tabContent}>
                <ManagerList managers={allManagers} onManagerRemoved={handleManagerRemoved} onManagerAdded={handleManagerAdded} />
              </div>
            )}

            {activeTab === 'payments' && (
              <div className={styles.tabContent}>
                <PaymentAnalytics analytics={paymentAnalytics} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}