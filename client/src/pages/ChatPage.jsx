// src/pages/ChatPage.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import ChatSidebar from "../components/ChatSidebar";
import ChatBox from "../components/ChatBox";
import styles from "../styles/buyerchat.module.css";


const ChatPage = () => {
  // Temporary mock user data
  const myUsername = "John";
  const myAccount = "user123";
  const backendURL = "https://your-backend-url.com/";

  // State
  const [socket, setSocket] = useState(null);
  const [senders, setSenders] = useState([
    { _id: "seller1", username: "Alice" },
    { _id: "seller2", username: "Bob" },
    { _id: "seller3", username: "Charlie" },
  ]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);

  // Connect socket and listen for messages
  useEffect(() => {
    const newSocket = io(backendURL, { withCredentials: true });
    setSocket(newSocket);

    newSocket.emit("buyer-register", { _id: myAccount });

    newSocket.on("newMessage", (data) => {
      if (data.sender === selectedSender?._id) {
        setMessages((prev) => [...prev, { sender: data.sender, message: data.message }]);
      }
    });

    return () => newSocket.disconnect();
  }, [backendURL, myAccount, selectedSender]);

  // Fetch messages for a selected contact
  async function fetchConversation(otherId) {
    try {
      const res = await fetch(`${backendURL}chat/messages/${otherId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
      else setMessages([]);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  // Handle selecting a contact
  const handleSelectSender = async (sender) => {
    setSelectedSender(sender);
    await fetchConversation(sender._id);
  };

  // Handle sending a new message
  const handleSendMessage = async (msg) => {
    if (!msg.trim() || !selectedSender) return;

    const messageData = {
      sender: myAccount,
      receiver: selectedSender._id,
      message: msg.trim(),
    };

    setMessages((prev) => [...prev, messageData]);
    socket.emit("send", messageData);

    await fetch(`${backendURL}chat/message/${selectedSender._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newMessage: { sender: myAccount, message: msg } }),
    });
  };

  return (
    <div className={styles.bodyWrapper}>
      <h1 id="myName">Welcome, {myUsername}</h1>
      <main className={styles.mainContent}>
        <ChatSidebar senders={senders} onSelectSender={handleSelectSender} />
        <ChatBox
          selectedSender={selectedSender}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default ChatPage;
