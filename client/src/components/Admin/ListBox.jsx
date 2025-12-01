import React from "react";
import styles from "../../styles/admin.module.css";

export default function ListBox({ title, list, field }) {
  return (
    <div className={styles.listBox}>
      <h3>{title}</h3>
      <ul>
        {list.map((item, i) => (
          <li key={i}>
            {item.name} — {item[field]}
          </li>
        ))}
      </ul>
    </div>
  );
}
