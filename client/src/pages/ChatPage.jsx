import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import ChatSidebar from "../components/ChatSidebar";
import ChatBox from "../components/ChatBox";
import styles from "../styles/buyerchat.module.css";


const ChatPage = () => {
  // store username here
  const [myUsername, setMyusername] = useState("");
  const [myAccount, setMyAccount] = useState("");
  const backendURL = "http://localhost:3000/";

  const [socket, setSocket] = useState(null);
  const [senders, setSenders] = useState([  // set this with fetch request to get contacts
    { _id: "seller1", username: "Alice" },
    { _id: "seller2", username: "Bob" },
    { _id: "seller3", username: "Charlie" },
  ]);

  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);

  // 1. Fetch Contacts useEffect
  useEffect(() => {
    async function fetchContacts() {
      console.log("1. Running fetch contacts...");
      try {
        const response = await fetch(`${backendURL}chat/contacts`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await response.json();
        console.log("2. Fetch :", data);

        if (data.success) {
          setSenders(data.contacts);
          setMyusername(data.userName);
          setMyAccount(data.myAccount);
        }
      } catch (error) {
        console.error("FAILED to fetch contacts:", error);
      }
    }
    fetchContacts();
  }, []); // Run once on mount

  // 2. Socket Connecting useEffect
  // If myAccount is not set then show some error page 
  useEffect(() => {
    if (!myAccount) {
      console.log("Waiting for user account data before connecting socket...");
      return;
    }

    console.log("Initiating Socket connection for:", myAccount);

    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Register immediately upon connection
    newSocket.on("connect", () => {
      console.log("Socket Connected! ID:", newSocket.id);
      newSocket.emit("buyer-register", { _id: myAccount });
    });

    // Cleanup
    return () => newSocket.disconnect();

  }, [myAccount]); // This Effect now waits for 'myAccount' to change

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

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      console.log("Received Message from Server:", data);
      if (selectedSender && data.sender === selectedSender._id) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.on("newMessage", handleIncomingMessage);
    return () => {
      socket.off("newMessage", handleIncomingMessage);
    };
  }, [socket, selectedSender]);

  const handleSelectSender = (sender) => {
    setSelectedSender(sender);
    setMessages([]);
  };

  const handleSendMessage = async (msg) => {
    if (!msg.trim() || !selectedSender) return;

    const messageData = {
      sender: myAccount,
      receiver: selectedSender._id,
      message: msg.trim(),
    };

    console.log("messageData: ", messageData);

    setMessages((prev) => [...prev, messageData]);
    socket.emit("send", messageData);

    // await fetch(`${backendURL}chat/message/${selectedSender._id}`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include",
    //   body: JSON.stringify({ newMessage: { sender: myAccount, message: msg } }),
    // });
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
          currentUser={myAccount}
        />
      </main>
    </div>
  );
};

export default ChatPage;
