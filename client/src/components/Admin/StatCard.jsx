import React from "react";
import styles from "../../styles/admin.module.css";

export default function StatCard({ title, value }) {
  return (
    <div className={styles.statCard}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
