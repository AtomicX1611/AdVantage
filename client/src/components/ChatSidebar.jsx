// src/components/ChatSidebar.jsx
import React from "react";
import ContactItem from "./ContactItem";
import styles from "../styles/buyerchat.module.css";

const ChatSidebar = ({ senders, onSelectSender }) => {
  return (
    <div className={styles.left}>
      <div className={styles.chatHead}>
        <h1>CHATS</h1>
      </div>
      <div className={styles.contacts}>
        {senders.map((sender) => (
          <ContactItem key={sender._id} sender={sender} onSelectSender={onSelectSender} />
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
