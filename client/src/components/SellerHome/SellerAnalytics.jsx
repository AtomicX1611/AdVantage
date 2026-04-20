import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import styles from '../../styles/sellerdashboard.module.css';
import API_CONFIG from '../../config/api.config';

const BACKEND = (API_CONFIG.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const BASE_CATEGORY_MAP = {
  Clothes: 0,
  Mobiles: 0,
  Laptops: 0,
  Electronics: 0,
  Books: 0,
  Furniture: 0,
  Automobiles: 0,
  Sports: 0,
  Fashion: 0,
  'Musical Instruments': 0,
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (value) => toNumber(value).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCount = (value) => toNumber(value).toLocaleString('en-IN');

const firstDefined = (...values) => values.find((v) => v !== undefined && v !== null);

const normalizeOrderStageCounts = (input) => {
  const base = {
    Pending: 0,
    Shipped: 0,
    Delivered: 0,
    Disputed: 0,
    Completed: 0,
  };

  if (!input || typeof input !== 'object') return base;

  Object.keys(base).forEach((stage) => {
    base[stage] = toNumber(firstDefined(input?.[stage], input?.[stage.toLowerCase()]));
  });

  return base;
};

const normalizeCategoryRevenue = (input) => {
  const result = { ...BASE_CATEGORY_MAP };

  if (Array.isArray(input)) {
    input.forEach((entry) => {
      const category = entry?.category || entry?._id;
      if (!category) return;
      result[category] = toNumber(firstDefined(entry?.revenue, entry?.amount, entry?.totalRevenue));
    });
    return result;
  }

  if (input && typeof input === 'object') {
    Object.entries(input).forEach(([category, value]) => {
      result[category] = toNumber(value);
    });
  }

  return result;
};

const normalizeAnalyticsPayload = (responseData) => {
  const source = responseData?.data || responseData?.analytics || responseData || {};
  const settlementSummary = source?.settlementSummary || source?.settlement_summary || {};
  const orderStageCounts = normalizeOrderStageCounts(
    firstDefined(
      source?.orderStageCounts,
      source?.order_stage_counts,
      settlementSummary?.orderStageCounts,
      settlementSummary?.order_stage_counts
    )
  );

  const normalizedSettled = normalizeCategoryRevenue(
    firstDefined(
      source?.categoryRevenueSettled,
      source?.category_revenue_settled,
      source?.revPerCat,
      source?.revenueByCategory
    )
  );

  const normalizedPending = normalizeCategoryRevenue(
    firstDefined(
      source?.categoryRevenuePending,
      source?.category_revenue_pending
    )
  );

  return {
    earnings: toNumber(firstDefined(source?.earnings, source?.totalEarnings, settlementSummary?.settledEarnings)),
    pendingRequest: toNumber(firstDefined(source?.pendingRequest, source?.pendingRequests)),
    itemsForSale: toNumber(firstDefined(source?.itemsForSale, source?.items_for_sale, source?.forSaleItems)),
    itemsSold: toNumber(firstDefined(source?.itemsSold, source?.items_sold, source?.soldItems)),
    settlementSummary: {
      settledEarnings: toNumber(firstDefined(settlementSummary?.settledEarnings, settlementSummary?.settled_earnings, source?.earnings)),
      pendingEarnings: toNumber(firstDefined(settlementSummary?.pendingEarnings, settlementSummary?.pending_earnings)),
      failedPayoutAmount: toNumber(firstDefined(settlementSummary?.failedPayoutAmount, settlementSummary?.failed_payout_amount)),
      disputedHoldAmount: toNumber(firstDefined(settlementSummary?.disputedHoldAmount, settlementSummary?.disputed_hold_amount)),
      finalizedAvailableBalance: toNumber(firstDefined(settlementSummary?.finalizedAvailableBalance, settlementSummary?.finalized_available_balance)),
      totalWithdrawnToDate: toNumber(firstDefined(settlementSummary?.totalWithdrawnToDate, settlementSummary?.total_withdrawn_to_date)),
      withdrawalsInProcessing: toNumber(firstDefined(settlementSummary?.withdrawalsInProcessing, settlementSummary?.withdrawals_in_processing)),
      failedWithdrawalAmount: toNumber(firstDefined(settlementSummary?.failedWithdrawalAmount, settlementSummary?.failed_withdrawal_amount)),
      lastWithdrawalAt: firstDefined(settlementSummary?.lastWithdrawalAt, settlementSummary?.last_withdrawal_at, null),
      lastWithdrawalStatus: firstDefined(settlementSummary?.lastWithdrawalStatus, settlementSummary?.last_withdrawal_status, null),
      escrowHeldAmount: toNumber(firstDefined(settlementSummary?.escrowHeldAmount, settlementSummary?.escrow_held_amount)),
      escrowReleasableAmount: toNumber(firstDefined(settlementSummary?.escrowReleasableAmount, settlementSummary?.escrow_releasable_amount)),
      escrowPendingReviewAmount: toNumber(firstDefined(settlementSummary?.escrowPendingReviewAmount, settlementSummary?.escrow_pending_review_amount)),
      escrowUnderDisputeAmount: toNumber(firstDefined(settlementSummary?.escrowUnderDisputeAmount, settlementSummary?.escrow_under_dispute_amount, settlementSummary?.disputedHoldAmount, settlementSummary?.disputed_hold_amount)),
      escrowReleasedTotal: toNumber(firstDefined(settlementSummary?.escrowReleasedTotal, settlementSummary?.escrow_released_total, settlementSummary?.settledEarnings, settlementSummary?.settled_earnings)),
      escrowFailedBlockedAmount: toNumber(firstDefined(settlementSummary?.escrowFailedBlockedAmount, settlementSummary?.escrow_failed_blocked_amount)),
      orderStageCounts,
    },
    revPerCat: normalizedSettled,
    categoryRevenueSettled: normalizedSettled,
    categoryRevenuePending: normalizedPending,
    orderStageCounts,
  };
};

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const SellerAnalytics = () => {
  const [Analytics, setAnalytics] = useState(null);
  const [revenueMode, setRevenueMode] = useState('settled');

  useEffect(() => {
    async function LoadAnalytics() {
      try {
        let response = await fetch(`${BACKEND}/user/selling-analytics`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            "content-type": "application/json"
          }
        });

        let responseData = await response.json();
        const normalized = normalizeAnalyticsPayload(responseData);
        if (responseData.success !== false) {
          setAnalytics(normalized);
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
    labels: ['Items for Sale', 'Items Sold'],
    datasets: [
      {
        data: [
          Analytics?.itemsForSale || 0,
          Analytics?.itemsSold || 0
        ],
        backgroundColor: ['#3b82f6', '#0f766e'],
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
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: ['Stage 1', 'Stage 2', 'Stage 3', 'Current'],
    datasets: [
      {
        label: 'Earnings Growth Trend',
        data: [0, (Analytics?.earnings || 0) * 0.3, (Analytics?.earnings || 0) * 0.7, Analytics?.earnings || 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#059669',
        borderWidth: 3,
      }
    ]
  };

  const settledSummary = Analytics?.settlementSummary || {};
  const stageCounts = Analytics?.orderStageCounts || settledSummary?.orderStageCounts || {};

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

      <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '1.4rem' }}>👛 Wallet Balances</h3>
      <div className={styles.grid} style={{ marginBottom: '40px' }}>
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', transform: 'translateY(0)', transition: 'all 0.3s ease' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#ecfdf5', opacity: 0.9 }}>Settled Earnings</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', margin: '10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Rs. {formatMoney(settledSummary?.settledEarnings || Analytics?.earnings || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>Processed payouts successfully</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#eff6ff', opacity: 0.9 }}>Finalized Available Balance</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', margin: '10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Rs. {formatMoney(settledSummary?.finalizedAvailableBalance || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>Ready for withdrawal to bank</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#fef3c7', opacity: 0.9 }}>Pending Settlement</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', margin: '10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Rs. {formatMoney(settledSummary?.pendingEarnings || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#fde68a' }}>Waiting for resolution</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#f5f3ff', opacity: 0.9 }}>Withdrawn To Date</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff', margin: '10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Rs. {formatMoney(settledSummary?.totalWithdrawnToDate || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#ddd6fe' }}>Transferred successfully to bank</span>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '1.4rem' }}>🔒 Escrow Pipeline Details</h3>
      <div className={styles.grid} style={{ marginBottom: '40px' }}>
        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #0ea5e9', background: 'rgba(255, 255, 255, 0.9)' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Escrow Held Amount</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {formatMoney(settledSummary?.escrowHeldAmount || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#0369a1' }}>Active orders pending resolution</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #16a34a', background: 'rgba(255, 255, 255, 0.9)' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Escrow Releasable Total</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {formatMoney(settledSummary?.escrowReleasableAmount || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#166534' }}>Ready to move from escrow to wallet</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #ef4444', background: 'rgba(255, 255, 255, 0.9)' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Escrow Under Dispute</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {formatMoney(settledSummary?.escrowUnderDisputeAmount || settledSummary?.disputedHoldAmount || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#b91c1c' }}>Blocked until dispute resolution</span>
          </div>
        </div>

        <div className={styles.card} style={{ height: 'auto', minHeight: '140px', borderLeft: '5px solid #6366f1', background: 'rgba(255, 255, 255, 0.9)' }}>
          <div className={styles.cardDetails}>
            <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Withdrawals In Processing</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: '10px 0' }}>
              Rs. {formatMoney(settledSummary?.withdrawalsInProcessing || 0)}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#4f46e5' }}>Bank transfer in progress</span>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ marginBottom: '30px', padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Order Stage Counts</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
          Live escrow pipeline stages for your current orders.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {Object.entries(stageCounts).map(([stage, value]) => (
            <div
              key={stage}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                background: '#f8fafc',
              }}
            >
              <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>{stage}</p>
              <p style={{ margin: '6px 0 0', fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>{formatCount(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECTION 2: CHARTS ROW 1 --- */}
      <h3 style={{ marginBottom: '20px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '1.4rem' }}>📊 Sales Distribution & Trends</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '30px' }}>
        {/* Doughnut Chart */}
        <div className={styles.card} style={{ flex: '1 1 350px', height: '400px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Inventory Distribution</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={commonOptions} />
          </div>
        </div>

        {/* Vertical Bar Chart substituting Line for trend */}
        <div className={styles.card} style={{ flex: '2 1 500px', height: '400px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Earnings Growth Trend</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Line data={lineData} options={commonOptions} />
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