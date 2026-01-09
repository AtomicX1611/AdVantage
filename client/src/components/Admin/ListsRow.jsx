import React from "react";
import SubscriptionList from "./SubscriptionList";
import styles from "../../styles/admin.module.css";

export default function ListsRow({ subscribedUsers }) {
  return (
    <div className={styles.listsRow}>
      <SubscriptionList users={subscribedUsers} />
    </div>
  );
}
