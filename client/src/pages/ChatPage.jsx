import React, { useState, useEffect,useRef, use } from "react";
import io from "socket.io-client";
import ChatSidebar from "../components/ChatSidebar";
import ChatBox from "../components/ChatBox";
import styles from "../styles/buyerchat.module.css";
import { useContext } from "react";
import { CurrentUserContext } from "../context/CurrentUserContextProvider.jsx";

const ChatPage = () => {
  // store username here
  const [myUsername, setMyusername] = useState("");
  const [myAccount, setMyAccount] = useState("");
  const backendURL = "http://localhost:3000/";
  // const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);

  const [socket, setSocket] = useState(null);
  const [senders, setSenders] = useState([]);

  /*
    State to store who is the current chatting user
    when updating check if newSender is already current sender
  */ 
  const [selectedSender, setSelectedSender] = useState(null); 
  const [messages, setMessages] = useState([]);

  
  async function fetchConversation(otherId) {
    try {
      const res = await fetch(`${backendURL}chat/messages/${otherId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      console.log("messages fetched: ",data.messages);

      if (data.success) setMessages(data.messages);
      else setMessages([]);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }
  
  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch(`${backendURL}chat/contacts`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setSenders(data.contacts);
          setMyusername(data.userName);
          setMyAccount(data.myAccount);
          // setCurrentUser(data.myAccount);
        }
      } catch (error) {
        console.error("FAILED to fetch contacts:", error);
      }
    }
    fetchContacts();
  }, []); // Run once on mount

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
    newSocket.on("connect", () => {
      console.log("Socket Connected! ID:", newSocket.id);
      newSocket.emit("buyer-register", { _id: myAccount });
    });

    // Cleanup
    return () => newSocket.disconnect();

  }, [myAccount]); 

  useEffect(() => {
    if (selectedSender) {
      fetchConversation(selectedSender._id);
    } else {
      console.log("No sender selected, skipping conversation fetch.");
    }
  }, [selectedSender]);

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
    if(selectedSender && selectedSender._id === sender._id) {
      console.log("Already current one");
      return;
    }
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

    await fetch(`http://localhost:3000/chat/message/${selectedSender._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newMessage: { sender: myAccount, message: msg } }),
    });
  };

  return (
    <div className={styles.bodyWrapper}>
      <h1 className={styles.welcomeHeading}>Welcome, {myUsername || 'User'}</h1>
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
