import React from "react";
import MiniPie from "./MiniPie";
import styles from "../../styles/admin.module.css";

export default function ChartsRow({ pieData }) {
  return (
    <div className={styles.chartsRow}>
      <div className={styles.chartBox}>
        <h3>User Activity</h3>
        <MiniPie
          labels={["Active", "Inactive"]}
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
    </div>
  );
}
