import React, { useState, useEffect } from "react";
import styles from "../styles/admin.module.css";
import API_CONFIG from "../config/api.config";

import StatsRow from "../components/Admin/StatsRow";
import ChartsRow from "../components/Admin/AdminChartsRow.jsx";
import ListsRow from "../components/Admin/ListsRow";

export default function AdminPage() {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "Loading..." },
    { title: "Subscribed Users", value: "Loading..." },
    { title: "Revenue (₹)", value: "Loading..." },
  ]);

  const [pieData, setPieData] = useState({
    users: [0, 0],
    subscriptions: [0, 0, 0]
  });

  const [subscribedUsers, setSubscribedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendURL = API_CONFIG.BACKEND_URL;

  // Fetch users data
  const fetchUsersData = async () => {
    try {
      const url = `${backendURL}${API_CONFIG.API_ENDPOINTS.ADMIN_USERS}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Users data received:', data);

      if (data.success && data.users) {
        const users = data.users;
        const totalUsers = users.length;
        const subscribedCount = users.filter(user => user.subscription && user.subscription.length > 0).length;

        // Calculate revenue from subscription data
        // Assuming subscription price: Basic=₹500, VIP=₹1500, Premium=₹2500
        let totalRevenue = 0;
        const subscriptionTypeCounts = { 'Basic': 0, 'VIP': 0, 'Premium': 0 };
        const subscriptionPrices = { 'Basic': 500, 'VIP': 1500, 'Premium': 2500 };

        users.forEach(user => {
          if (user.subscription && user.subscription.length > 0) {
            const subType = user.subscription[0]?.type || 'Basic';
            subscriptionTypeCounts[subType] = (subscriptionTypeCounts[subType] || 0) + 1;
            totalRevenue += subscriptionPrices[subType] || 0;
          }
        });

        // Update stats
        setStats([
          { title: "Total Users", value: totalUsers },
          { title: "Subscribed Users", value: subscribedCount },
          { title: "Revenue (₹)", value: totalRevenue.toLocaleString('en-IN') },
        ]);

        // Extract subscribed users for list
        const subscribed = users
          .filter(user => user.subscription && user.subscription.length > 0)
          .slice(0, 5)
          .map(user => ({
            name: user.username || user.email || "Unknown",
            subscription: user.subscription[0]?.type || "Active",
          }));

        setSubscribedUsers(subscribed);

        // Calculate pie data for users (subscribed vs unsubscribed)
        const unsubscribedCount = totalUsers - subscribedCount;
        setPieData(prev => ({
          ...prev,
          users: [subscribedCount, unsubscribedCount],
          subscriptions: [
            subscriptionTypeCounts['Basic'] || 0,
            subscriptionTypeCounts['VIP'] || 0,
            subscriptionTypeCounts['Premium'] || 0
          ]
        }));
      }
    } catch (err) {
      console.error("Error fetching users data:", err);
      setError("Failed to fetch users data");
    }
  };

  // Fetch graph data
  const fetchGraphData = async () => {
    try {
      const url = `${backendURL}${API_CONFIG.API_ENDPOINTS.ADMIN_GRAPH_DATA}`;
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

      if (data.success && data.graphData) {
        // graphData contains product counts per category or time period
        console.log("Graph data:", data.graphData);
        
        // Update subscription pie chart data
        // Assuming first 3 values correspond to Basic, VIP, Premium
        const subscriptionCounts = [
          data.graphData[0]?.y || 0,
          data.graphData[1]?.y || 0,
          data.graphData[2]?.y || 0
        ];
        
        setPieData(prev => ({
          ...prev,
          subscriptions: subscriptionCounts
        }));
      }
    } catch (err) {
      console.error("Error fetching graph data:", err);
      setError(prev => prev || "Failed to fetch graph data");
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUsersData(),
          fetchGraphData(),
        ]);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
    </div>
  );
}
