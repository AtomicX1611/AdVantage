// src/components/ChatBox.jsx
import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import styles from "../styles/buyerchat.module.css";

const ChatBox = ({ selectedSender, messages, onSendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    onSendMessage(text);
    setText("");
  };

  return (
    <div className={styles.chatbox}>
      <div className={styles.currentChat}>
        <div className={styles.dp}></div>
        <div className={styles.currentSender}>
          {selectedSender ? selectedSender.username : "Select a chat"}
        </div>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <MessageBubble key={index} msg={msg} selectedSender={selectedSender} />
        ))}
      </div>

      <div className={styles.type}>
        <textarea
          id="text-box"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className={styles.sendBtn} onClick={handleSend}>
          Send <i className="bx bx-send"></i>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
