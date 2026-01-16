import React, { useState, useEffect } from "react";
import styles from "../styles/admin.module.css";
import API_CONFIG from "../config/api.config";

import StatsRow from "../components/Admin/StatsRow";
import ChartsRow from "../components/Admin/AdminChartsRow.jsx";
import ListsRow from "../components/Admin/ListsRow";
import PaymentHistory from "../components/Admin/PaymentHistory";
import UserList from "../components/Admin/UserList";

export default function AdminPage() {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "Loading..." },
    { title: "Total Products", value: "Loading..." },
    { title: "Total Payments", value: "Loading..." },
    { title: "Revenue (₹)", value: "Loading..." },
  ]);

  const [pieData, setPieData] = useState({
    users: [0, 0, 0], // admins, managers, regular users
    subscriptions: [0, 0, 0]
  });

  const [subscribedUsers, setSubscribedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendURL = API_CONFIG.BACKEND_URL;

  // Fetch all data from the new endpoint
  const fetchAllData = async () => {
    try {
      const url = `${backendURL}/${API_CONFIG.API_ENDPOINTS.ADMIN_USERS}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Admin data received:', responseData);

      if (responseData.success && responseData.data && responseData.counts) {
        const { data, counts } = responseData;

        // Calculate total revenue from payments
        const totalRevenue = data.payments.reduce((sum, payment) => sum + (payment.price || 0), 0);

        // Update stats
        setStats([
          { title: "Total Users", value: counts.users || 0 },
          { title: "Total Products", value: counts.products || 0 },
          { title: "Total Payments", value: counts.payments || 0 },
          { title: "Revenue (₹)", value: totalRevenue.toLocaleString('en-IN') },
        ]);

        // Extract subscribed users from users array
        const subscribed = data.users
          .filter(user => user.subscription && user.subscription.length > 0)
          .slice(0, 5)
          .map(user => ({
            name: user.username || user.email || "Unknown",
            subscription: user.subscription[0]?.type || "Active",
          }));

        setSubscribedUsers(subscribed);

        // Store all users for the user list
        setAllUsers(data.users);

        // Process payment history for display
        const formattedPayments = data.payments.slice(0, 10).map(payment => {
          // Find the from user/admin/manager
          let fromName = "Unknown";
          if (payment.fromModel === 'Users') {
            const fromUser = data.users.find(u => u._id === payment.from);
            fromName = fromUser?.username || fromUser?.email || "Unknown User";
          } else if (payment.fromModel === 'Admin') {
            const fromAdmin = data.admins.find(a => a._id === payment.from);
            fromName = fromAdmin?.email || "Unknown Admin";
          } else if (payment.fromModel === 'Managers') {
            const fromManager = data.managers.find(m => m._id === payment.from);
            fromName = fromManager?.username || fromManager?.email || "Unknown Manager";
          }

          // Find the to user/admin/manager
          let toName = "Unknown";
          if (payment.toModel === 'Users') {
            const toUser = data.users.find(u => u._id === payment.to);
            toName = toUser?.username || toUser?.email || "Unknown User";
          } else if (payment.toModel === 'Admin') {
            const toAdmin = data.admins.find(a => a._id === payment.to);
            toName = toAdmin?.email || "Unknown Admin";
          } else if (payment.toModel === 'Managers') {
            const toManager = data.managers.find(m => m._id === payment.to);
            toName = toManager?.username || toManager?.email || "Unknown Manager";
          }

          return {
            user: fromName,
            type: payment.paymentType,
            amount: payment.price.toLocaleString('en-IN'),
            to: toName,
            date: new Date(payment.date).toLocaleDateString('en-IN')
          };
        });

        setPayments(formattedPayments);

        // Calculate pie data for user distribution
        setPieData({
          users: [counts.admins || 0, counts.managers || 0, counts.users || 0],
          subscriptions: [
            data.users.filter(u => u.subscription?.[0]?.type === 'Basic').length,
            data.users.filter(u => u.subscription?.[0]?.type === 'VIP').length,
            data.users.filter(u => u.subscription?.[0]?.type === 'Premium').length
          ]
        });
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to fetch admin data");
    }
  };

  // Handle user removal
  const handleUserRemoved = (userId) => {
    // Remove user from allUsers list
    setAllUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
    
    // Remove from subscribed users if present
    setSubscribedUsers(prevSubscribed => 
      prevSubscribed.filter(u => u._id !== userId)
    );

    // Update stats
    setStats(prevStats => {
      const newStats = [...prevStats];
      const totalUsersIndex = 0;
      if (newStats[totalUsersIndex]) {
        const currentValue = parseInt(newStats[totalUsersIndex].value);
        newStats[totalUsersIndex] = {
          ...newStats[totalUsersIndex],
          value: currentValue - 1
        };
      }
      return newStats;
    });

    // Update pie data
    setPieData(prevPieData => ({
      ...prevPieData,
      users: [
        prevPieData.users[0], // admins unchanged
        prevPieData.users[1], // managers unchanged
        Math.max(0, prevPieData.users[2] - 1) // decrease regular users
      ]
    }));
  };

  // Fetch graph data
  const fetchGraphData = async () => {
    try {
      const url = `${backendURL}/${API_CONFIG.API_ENDPOINTS.ADMIN_GRAPH_DATA}`;
      console.log('Fetching graph data from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch graph data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Graph data received:', data);

      // Graph data is optional - don't set error if it fails
      if (data.success && data.graphData) {
        console.log("Graph data:", data.graphData);
      }
    } catch (err) {
      console.error("Error fetching graph data:", err);
      // Don't set error state for graph data failure
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        await fetchAllData();
        await fetchGraphData();
      } catch (err) {
        console.error("Error loading admin data:", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <h1 className={styles.adminTitle}>Admin Dashboard</h1>
        <p style={{ textAlign: 'center', padding: '20px' }}>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminContainer}>
        <h1 className={styles.adminTitle}>Admin Dashboard</h1>
        <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          Error: {error}
        </p>
        <p style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#666' }}>
          Backend URL: {backendURL}
        </p>
        <p style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#666' }}>
          Make sure the backend server is running on {backendURL}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.adminTitle}>Admin Dashboard</h1>

      <StatsRow stats={stats} />

      <ChartsRow pieData={pieData} />

      <ListsRow subscribedUsers={subscribedUsers} />

      {payments.length > 0 && <PaymentHistory payments={payments} />}

      <UserList users={allUsers} onUserRemoved={handleUserRemoved} />
    </div>
  );
}