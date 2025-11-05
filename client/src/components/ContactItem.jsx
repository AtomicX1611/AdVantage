// src/components/ContactItem.jsx
import React from "react";
import styles from "../styles/buyerchat.module.css";

const ContactItem = ({ sender, onSelectSender }) => {
  return (
    <div className={styles.person} onClick={() => onSelectSender(sender)}>
      <div className={styles.dp}></div>
      <div className={styles.name}>{sender.username}</div>
    </div>
  );
};

export default ContactItem;
