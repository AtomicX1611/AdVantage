import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import styles from '../../styles/sellerdashboard.module.css';
import { useEffect } from 'react';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const SellerAnalytics = () => {
  // --- DUMMY DATA (Replace with API data later) ---
  useEffect(()=>{
    async function LoadAnalytics() {
      let response  = await fetch('http://localhost:3000/user/selling-analytics',{
        method:'GET',
        credentials:'include',
        headers:{
          "content-type":"application/json"
        }
      });

      let responseData = await response.json();
      console.log("data for sdb: ",responseData);
    }
    LoadAnalytics();
  },[])
  const stats = {
    totalEarnings: 1250,
    itemsSold: 12,
    activeRentals: 5,
    pendingRequests: 3
  };

  // Chart 1: Inventory Distribution (Sale vs Rent)
  const doughnutData = {
    labels: ['Items for Sale', 'Items for Rent'],
    datasets: [
      {
        data: [15, 8], // e.g., 15 items uploaded for sale, 8 for rent
        backgroundColor: [
          '#3b82f6', // Blue (Sale)
          '#10b981', // Emerald (Rent)
        ],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  // Chart 2: Success Rate (Sold vs Rented Out)
  const barData = {
    labels: ['Completed Transactions'],
    datasets: [
      {
        label: 'Items Sold',
        data: [12],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Items Rented Out',
        data: [5],
        backgroundColor: '#10b981',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Segoe UI', size: 12 } }
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Seller Analytics</h2>

      {/* --- SECTION 1: STATS CARDS --- */}
      <div className={styles.grid} style={{ marginBottom: '40px' }}>
        
        {/* Card 1: Earnings */}
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #10b981' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Total Earnings</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              ${stats.totalEarnings}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#10b981' }}>+12% from last month</span>
          </div>
        </div>

        {/* Card 2: Sales Volume */}
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #3b82f6' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Items Sold</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              {stats.itemsSold}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Lifetime sales</span>
          </div>
        </div>

        {/* Card 3: Active Rentals */}
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #f59e0b' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Active Rentals</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              {stats.activeRentals}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#f59e0b' }}>Currently with users</span>
          </div>
        </div>

        {/* Card 4: Pending Requests */}
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #ef4444' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Pending Requests</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              {stats.pendingRequests}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Action required</span>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CHARTS --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        
        {/* Doughnut Chart Container */}
        <div className={styles.card} style={{ flex: '1 1 400px', height: '400px', padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Inventory Distribution</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className={styles.card} style={{ flex: '1 1 400px', height: '400px', padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Sales vs. Rentals Performance</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerAnalytics;