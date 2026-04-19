import React from "react";
import StatCard from "./StatCard";
import styles from "../../styles/admin.module.css";

export default function StatsRow({ stats }) {
  return (
    <div className={styles.metricsGrid}>
      {stats.map((item, index) => (
        <StatCard
          key={index}
          title={item.title}
          value={item.value}
          icon={item.icon}
          colorClass={item.colorClass}
        />
      ))}
    </div>
  );
}
