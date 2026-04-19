import React from "react";
import MiniPie from "./MiniPie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import styles from "../../styles/admin.module.css";

const COLORS = ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#f44336", "#00bcd4", "#e91e63", "#607d8b", "#795548", "#3f51b5"];

const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

export default function ChartsRow({ pieData, categoryProductCounts, revenueByCategory }) {
  return (
    <div className={styles.chartsGrid}>
      {/* Row 1: Pie Charts */}
      <div className={styles.chartBox}>
        <h3>User Distribution</h3>
        <MiniPie
          labels={["Admins", "Managers", "Users"]}
          values={pieData.users}
        />
      </div>

      <div className={styles.chartBox}>
        <h3>Subscriptions</h3>
        <MiniPie
          labels={["Basic", "VIP", "Premium"]}
          values={pieData.subscriptions}
        />
      </div>

      {/* Row 2: Category Charts */}
      <div className={styles.chartBox}>
        <h3>Products by Category</h3>
        {categoryProductCounts && categoryProductCounts.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryProductCounts} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="unsold" stackId="a" fill="#4caf50" name="Available" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sold" stackId="a" fill="#1976d2" name="Sold" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyText}>No category data available</div>
        )}
      </div>

      <div className={styles.chartBox}>
        <h3>Revenue by Category</h3>
        {revenueByCategory && revenueByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByCategory} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#ff9800" name="Revenue" radius={[0, 4, 4, 0]}>
                {revenueByCategory.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyText}>No revenue data available</div>
        )}
      </div>
    </div>
  );
}
