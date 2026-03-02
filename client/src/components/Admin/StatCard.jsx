import React from "react";
import "boxicons/css/boxicons.min.css";
import styles from "../../styles/admin.module.css";

export default function StatCard({ title, value, icon, colorClass }) {
  return (
    <div className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[colorClass] || styles.metricIconBlue}`}>
        <i className={icon || "bx bxs-info-circle"}></i>
      </div>
      <div className={styles.metricInfo}>
        <p className={styles.metricValue}>{value}</p>
        <p className={styles.metricLabel}>{title}</p>
      </div>
    </div>
  );
}
