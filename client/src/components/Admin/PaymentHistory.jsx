import React from "react";
import styles from "../../styles/admin.module.css";

export default function PaymentHistory({ payments }) {
  return (
    <div className={styles.paymentBox}>
      <h3>Payment History</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Amount (₹)</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i}>
              <td>{p.user}</td>
              <td>{p.type}</td>
              <td>{p.amount}</td>
              <td>{p.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
