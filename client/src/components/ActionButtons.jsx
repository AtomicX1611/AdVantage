import React from "react";
import styles from "../styles/productdetails.module.css";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api.config";

const BACKEND = (API_CONFIG.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const ActionButtons = ({ isRental, soldTo, onAddToWishlist, onRentNow, onBuyNow, onComplain, sellerId, isOwner, isAuth }) => {
  const navigate = useNavigate();
  async function handleChat() {
    if (!isAuth) {
      alert("Please sign in to chat with the seller");
      navigate('/auth/login');
      return;
    }
    let response = await fetch(`${BACKEND}/chat/createContact/${sellerId._id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    let data = await response.json();
    console.log("data in chatwith seller: ", data);
    if (!data.success) {
      alert("Error in creating chat contact: " + data.message);
      return;
    }
    navigate('/chat');
  }

  return (
    <div className={styles.options}>
      {!isOwner && (
        <button id="addToWishlist" className={styles.btn} onClick={onAddToWishlist}>
          Add to Wishlist
        </button>
      )}

      {!isOwner && (
        <button
          className={styles.btn}
          onClick={handleChat}
        >
          Chat with Seller
        </button>
      )}

      {!isOwner && !soldTo && !isRental && (
        <button className={styles.btn} onClick={onBuyNow}>Buy Now</button>
      )}

      {!isOwner && !soldTo && isRental && (
        <button className={styles.btn} onClick={onRentNow}>
          Rent Now
        </button>
      )}

      <button
        className={styles.btn}
        style={{ backgroundColor: "#fff3f3", color: "#d32f2f", border: "1px solid #d32f2f" }}
        onClick={onComplain}
      >
        Report / Complain
      </button>
    </div>
  );
};

export default ActionButtons;
