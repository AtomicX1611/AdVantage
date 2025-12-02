import React from "react";
import styles from "../styles/productdetails.module.css";
import { useNavigate } from "react-router-dom";

const ActionButtons = ({ isRental, soldTo, onAddToWishlist, onRentNow, onBuyNow ,sellerId}) => {
  const navigate = useNavigate();
  async function handleChat() {
    alert("Chat feature coming soon!");
    console.log("seller id: ",sellerId);

    let response =await fetch(`http://localhost:3000/chat/createContact/${sellerId._id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    let data=await response.json();
    console.log("data in chatwith seller: ",data);
    if(!data.success){
      alert("Error in creating chat contact: "+data.message);
      return;
    }
    navigate('/chat');
  }

  return (
    <div className={styles.options}>
      <button id="addToWishlist" className={styles.btn} onClick={onAddToWishlist}>
        Add to Wishlist
      </button>

      <button 
      className={styles.btn}
      onClick={handleChat}
      >
      Chat with Seller
      </button>

      {!soldTo && !isRental && (
        <button className={styles.btn} onClick={onBuyNow}>Buy Now</button>
      )}

      {!soldTo && isRental && (
        <button className={styles.btn} onClick={onRentNow}>
          Rent Now
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
