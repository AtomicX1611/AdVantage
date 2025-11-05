// src/components/MessageBubble.jsx
import React from "react";
import styles from "../styles/buyerchat.module.css";

const MessageBubble = ({ msg, selectedSender }) => {
  const isLeft = msg.sender === selectedSender?._id;

  return (
    <div
      className={`${isLeft ? styles.messageLeft : styles.messageRight} ${styles.msgStyle}`}
    >
      {isLeft && <div className={styles.dpCircleSmall}></div>}
      <div className={styles.messageContent}>{msg.message}</div>
      {!isLeft && <div className={styles.dpCircleSmall}></div>}
    </div>
  );
};

export default MessageBubble;
