import React from "react";
import styles from "../../styles/admin.module.css";

export default function AdminRecentActivity({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className={styles.recentActivityBox}>
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <p className={styles.emptyText}>No recent activity</p>
      </div>
    );
  }

  return (
    <div className={styles.recentActivityBox}>
      <h3 className={styles.sectionTitle}>Recent Activity</h3>
      <div className={styles.activityTableWrapper}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Type</th>
              <th>Amount (₹)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item, index) => (
              <tr key={item._id || index}>
                <td>{item.from}</td>
                <td>{item.to}</td>
                <td>
                  <span
                    className={`${styles.activityBadge} ${
                      item.type === "purchase"
                        ? styles.badgePurchase
                        : item.type === "subscription"
                        ? styles.badgeSubscription
                        : styles.badgeOther
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className={styles.amountCell}>
                  ₹{item.amount?.toLocaleString("en-IN")}
                </td>
                <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
