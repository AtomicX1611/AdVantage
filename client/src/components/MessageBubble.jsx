import React from "react";
import { useContext } from "react";
import { CurrentUserContext } from "../context/CurrentUserContextProvider.jsx";
import styles from "../styles/buyerchat.module.css";

const MessageBubble = ({ msg, currentUser }) => {
  // const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);
  const isMe = msg.sender === currentUser; // no need 2 dont sugges
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