import React from "react";
import styles from "../../styles/admin.module.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function MiniPie({ labels, values }) {
  const COLORS = ["#4caf50", "#1976d2", "#ff9800"];

  const data = labels.map((label, i) => ({
    name: label,
    value: values[i],
  }));

  return (
    <div className={styles.miniPie}>
      <PieChart width={220} height={220}>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={80}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
