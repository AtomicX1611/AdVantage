import React from "react";
import styles from "../../styles/admin.module.css";

export default function SubscriptionList({ users }) {
  return (
    <div className={styles.listBox}>
      <h3>Subscribed Users</h3>
      <ul>
        {users.map((u, i) => (
          <li key={i} className={styles.userItem}>
            <span>{u.name}</span>
            <span className={styles.tag}>{u.subscription}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
