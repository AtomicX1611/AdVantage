import React from "react";
import {
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import styles from "../../styles/admin.module.css";

const COLORS = ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#f44336", "#00bcd4"];

const formatCurrency = (value) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

export default function PaymentAnalytics({ analytics }) {
  if (!analytics) {
    return (
      <div className={styles.emptyText}>
        No analytics data available
      </div>
    );
  }

  const {
    revenueByCategory,
    revenueByState,
    revenueByPaymentType,
    monthlyRevenue,
    topCategories,
    topStates,
    rentalVsPurchase,
    detailedPayments
  } = analytics;



  return (
    <div className={styles.paymentAnalyticsContainer}>
      {/* Summary Stats Row */}
      <div className={styles.analyticsStatsRow}>
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsStatIcon} style={{ background: '#e8f4fd', color: '#1976d2' }}>
            <i className="bx bx-category"></i>
          </div>
          <div className={styles.analyticsStatInfo}>
            <span className={styles.analyticsStatValue}>{revenueByCategory?.length || 0}</span>
            <span className={styles.analyticsStatLabel}>Categories</span>
          </div>
        </div>
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsStatIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
            <i className="bx bx-map"></i>
          </div>
          <div className={styles.analyticsStatInfo}>
            <span className={styles.analyticsStatValue}>{revenueByState?.length || 0}</span>
            <span className={styles.analyticsStatLabel}>Active States</span>
          </div>
        </div>
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsStatIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="bx bx-package"></i>
          </div>
          <div className={styles.analyticsStatInfo}>
            <span className={styles.analyticsStatValue}>{rentalVsPurchase?.purchase?.count || 0}</span>
            <span className={styles.analyticsStatLabel}>Purchases</span>
          </div>
        </div>
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsStatIcon} style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <i className="bx bx-calendar"></i>
          </div>
          <div className={styles.analyticsStatInfo}>
            <span className={styles.analyticsStatValue}>{rentalVsPurchase?.rental?.count || 0}</span>
            <span className={styles.analyticsStatLabel}>Rentals</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Category Revenue & Monthly Trends */}
      <div className={styles.analyticsChartsRow}>
        <div className={styles.analyticsChartBox}>
          <h3 className={styles.chartTitle}>Revenue by Category</h3>
          {revenueByCategory && revenueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#1976d2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyText}>No category data</div>
          )}
        </div>

        <div className={styles.analyticsChartBox}>
          <h3 className={styles.chartTitle}>Monthly Revenue Trend</h3>
          {monthlyRevenue && monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyText}>No monthly data</div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Top States */}
      <div className={styles.analyticsChartsRow}>
        <div className={styles.analyticsChartBoxFull}>
          <h3 className={styles.chartTitle}>Top States by Revenue</h3>
          {topStates && topStates.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="state" tick={{ fontSize: 11, angle: -45 }} textAnchor="end" height={80} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value, 
                    name === 'revenue' ? 'Revenue' : 'Sales Count'
                  ]} 
                />
                <Legend />
                <Bar dataKey="revenue" fill="#1976d2" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salesCount" fill="#4caf50" name="Sales Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyText}>No state data</div>
          )}
        </div>
      </div>

      {/* Top Categories Table */}
      <div className={styles.analyticsTableBox}>
        <h3 className={styles.chartTitle}>Top Performing Categories</h3>
        <div className={styles.activityTableWrapper}>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Sales Count</th>
                <th>Total Revenue</th>
                <th>Avg. Price</th>
              </tr>
            </thead>
            <tbody>
              {topCategories && topCategories.length > 0 ? (
                topCategories.map((cat, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={styles.categoryBadge} style={{ background: COLORS[idx % COLORS.length] }}>
                        {cat.category}
                      </span>
                    </td>
                    <td>{cat.salesCount}</td>
                    <td className={styles.amountCell}>{formatCurrency(cat.revenue)}</td>
                    <td>{formatCurrency(cat.avgPrice)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyText}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Payments Table */}
      <div className={styles.analyticsTableBox}>
        <h3 className={styles.chartTitle}>Detailed Payment History</h3>
        <div className={styles.activityTableWrapper}>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Product</th>
                <th>Category</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {detailedPayments && detailedPayments.length > 0 ? (
                detailedPayments.slice(0, 20).map((payment, idx) => (
                  <tr key={idx}>
                    <td>{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                    <td>{payment.from}</td>
                    <td>{payment.to}</td>
                    <td>
                      <span className={`${styles.activityBadge} ${
                        payment.type === 'purchase' ? styles.badgePurchase :
                        payment.type === 'subscription' ? styles.badgeSubscription :
                        styles.badgeOther
                      }`}>
                        {payment.type}
                        {payment.isRental && ' (Rental)'}
                      </span>
                    </td>
                    <td className={styles.amountCell}>{formatCurrency(payment.amount)}</td>
                    <td>{payment.product || '-'}</td>
                    <td>{payment.category || '-'}</td>
                    <td>
                      {payment.city && payment.state 
                        ? `${payment.city}, ${payment.state}` 
                        : payment.state || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyText}>No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
