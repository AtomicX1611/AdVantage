import React from "react";
import styles from "../styles/buyerchat.module.css";

const MessageBubble = ({ msg, currentUser }) => {
  const isMe = msg.sender === currentUser;
  const isLeft = !isMe;

  return (
    <div
      className={`${isLeft ? styles['message-left'] : styles['message-right']} ${styles.msgStyle}`}
    >
      {isLeft && <div className={styles.dpCircleSmall}></div>}
      
      <div className={styles['message-content']}>{msg.message}</div>
      {isMe && <div className={styles.dpCircleSmall}></div>}
    </div>
  );
};

export default MessageBubble;