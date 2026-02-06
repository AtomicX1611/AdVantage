import React from "react";
import StatCard from "./StatCard";
import styles from "../../styles/admin.module.css";

export default function StatsRow({ stats }) {
  return (
    <div className={styles.statsRow}>
      {stats.map((item, index) => (
        <StatCard key={index} title={item.title} value={item.value} />
      ))}
    </div>
  );
}
