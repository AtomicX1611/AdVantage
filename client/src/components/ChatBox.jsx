// src/components/ChatBox.jsx
import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import styles from "../styles/buyerchat.module.css";

const ChatBox = ({ currentUser, selectedSender, messages, onSendMessage }) => {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
          <MessageBubble key={index} msg={msg} selectedSender={selectedSender} currentUser={currentUser} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.type}>
        <textarea
          className={styles['text-box']}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className={styles['send-btn']} onClick={handleSend}>
          Send <i className="bx bx-send"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
