import React, { useState, useEffect } from 'react';
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
  const [Analytics, setAnalytics] = useState(null);
  const [revenueMode, setRevenueMode] = useState('settled');

  useEffect(() => {
    async function LoadAnalytics() {
      try {
        let response = await fetch('http://localhost:3000/user/selling-analytics', {
          method: 'GET',
          credentials: 'include',
          headers: {
            "content-type": "application/json"
          }
        });

        let responseData = await response.json();
        if (responseData.success) {
          setAnalytics(responseData.data);
          return;
        }
        // alert("Failed to load Analytics"); // Optional: suppress alert on load
      } catch (error) {
        console.error("Error loading analytics", error);
      }
    }
    LoadAnalytics();
  }, []);

  // --- CHART 1 DATA: Inventory (Existing) ---
  const doughnutData = {
    labels: ['Items for Sale', 'Items for Rent'],
    datasets: [
      {
        data: [
          Analytics?.itemsForSale || 0,
          Analytics?.itemsToRent || 0
        ],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  // --- CHART 2 DATA: Success Rate (Existing) ---
  const barData = {
    labels: ['Completed Transactions'],
    datasets: [
      {
        label: 'Items Sold',
        data: [Analytics?.itemsSold || 0],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Items Rented Out',
        data: [Analytics?.activeRentals || 0],
        backgroundColor: '#10b981',
      },
    ],
  };

  const settledSummary = Analytics?.settlementSummary || {};

  const categoryData = revenueMode === 'pending'
    ? (Analytics?.categoryRevenuePending || {})
    : (Analytics?.categoryRevenueSettled || {});

  const categoryChartData = {
    labels: Object.keys(categoryData).length > 0
      ? Object.keys(categoryData)
      : [
          "Clothes", "Mobiles", "Laptops", "Electronics", "Books",
          "Furniture", "Automobiles", "Sports", "Fashion", "Musical Instruments",
        ],

    datasets: [
      {
        label: revenueMode === 'pending' ? 'Pending Revenue (Rs.)' : 'Settled Revenue (Rs.)',
        data: Object.keys(categoryData).length > 0
          ? Object.values(categoryData)
          : [
              Analytics?.revPerCat?.["Clothes"] || 0,
              Analytics?.revPerCat?.["Mobiles"] || 0,
              Analytics?.revPerCat?.["Laptops"] || 0,
              Analytics?.revPerCat?.["Electronics"] || 0,
              Analytics?.revPerCat?.["Books"] || 0,
              Analytics?.revPerCat?.["Furniture"] || 0,
              Analytics?.revPerCat?.["Automobiles"] || 0,
              Analytics?.revPerCat?.["Sports"] || 0,
              Analytics?.revPerCat?.["Fashion"] || 0,
              Analytics?.revPerCat?.["Musical Instruments"] || 0
            ],
        backgroundColor: [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
          '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#d946ef'
        ],
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const horizontalOptions = {
    indexAxis: 'y', // <--- THIS MAKES IT HORIZONTAL
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hide legend since labels are on the axis
      title: { display: false }
    },
    scales: {
      x: {
        grid: { display: false } // Cleaner look
      }
    }
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Segoe UI', size: 12 } } }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <h2>Seller Analytics</h2>

      {/* --- SECTION 1: STATS CARDS --- */}
      <div className={styles.grid} style={{ marginBottom: '40px' }}>
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #10b981' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Settled Earnings</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {settledSummary?.settledEarnings || Analytics?.earnings || 0}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#10b981' }}>Processed payouts only</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #3b82f6' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Finalized Available Balance</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {settledSummary?.finalizedAvailableBalance || 0}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ready for withdrawal</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #f59e0b' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Withdrawn To Date</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {settledSummary?.totalWithdrawnToDate || 0}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#0f766e' }}>Transferred successfully</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #ef4444' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Withdrawals In Processing</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {settledSummary?.withdrawalsInProcessing || 0}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Bank transfer in progress</span>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CHARTS ROW 1 --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '30px' }}>
        {/* Doughnut Chart */}
        <div className={styles.card} style={{ flex: '1 1 400px', height: '400px', padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Inventory Distribution</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={commonOptions} />
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className={styles.card} style={{ flex: '1 1 400px', height: '400px', padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Sales vs. Rentals Performance</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={barData} options={commonOptions} />
          </div>
        </div>
      </div>

      {/* --- SECTION 3: REVENUE BY CATEGORY (NEW) --- */}
      <div className={styles.card} style={{ width: '100%', height: '500px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h3 style={{ marginBottom: '8px' }}>Revenue by Category</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setRevenueMode('settled')}
              style={{
                border: '1px solid #d1d5db',
                background: revenueMode === 'settled' ? '#1e293b' : '#fff',
                color: revenueMode === 'settled' ? '#fff' : '#1f2937',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Settled
            </button>
            <button
              type="button"
              onClick={() => setRevenueMode('pending')}
              style={{
                border: '1px solid #d1d5db',
                background: revenueMode === 'pending' ? '#1e293b' : '#fff',
                color: revenueMode === 'pending' ? '#fff' : '#1f2937',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Pending
            </button>
          </div>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
          {revenueMode === 'pending'
            ? 'Pending payout breakdown by category (not settled yet)'
            : 'Settled earnings breakdown by category'}
        </p>
        <div style={{ height: '400px', position: 'relative' }}>
          {/* We reuse the Bar component but pass indexAxis: 'y' in options */}
          <Bar data={categoryChartData} options={horizontalOptions} />
        </div>
      </div>

    </div>
  );
};

export default SellerAnalytics;