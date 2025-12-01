import React, { useState } from "react";
import styles from "../styles/paymentpage.module.css";
import { act } from "react";
import { useNavigate } from "react-router-dom";

const PaymentInputs = ({ type , price }) => {
  const [activeMethod, setActiveMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    cvv: "",
  });

  const navigate = useNavigate();

  const handlePayment = async (payMethod) => {
    if (payMethod === "card") {
      const { cardNumber, cardHolder, cvv } = cardDetails;
      const cardNumberDigits = cardNumber.replace(/\s+/g, "");

      if (!/^\d{16}$/.test(cardNumberDigits)) {
        alert("Please enter a valid 16-digit card number.");
        return;
      }
      if (/^(\d)\1{15}$/.test(cardNumberDigits)) {
        alert("Card number cannot be all the same digit.");
        return;
      }
      if (!/^[A-Za-z ]{2,}$/.test(cardHolder)) {
        alert("Please enter a valid card holder name.");
        return;
      }
      if (!/^\d{3}$/.test(cvv) || /^0{3}$/.test(cvv)) {
        alert("Please enter a valid 3-digit CVV (cannot be all zeros).");
        return;
      }
    }

    const res = await fetch("http://localhost:3000/payment/processPayment", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ payTo: "Admin", paymentType: "subscription", price: price }),
    });

    const data=await res.json();
    console.log("data: ",data);

    if(data.success) {
      alert("Payment Done successfully");
      navigate("/seller/dashboard");
    }
  };

  return (
    <div className={`${styles["payment-type"]} ${styles.box}`}>
      <h2>Select Payment Method:</h2>

      <div className={styles["payment-options"]}>
        <button
          className={`${styles["payment-option"]} ${
            activeMethod === "card" ? styles.active : ""
          }`}
          onClick={() => setActiveMethod("card")}
        >
        Debit Card
        </button>
        <button
          className={`${styles["payment-option"]} ${
            activeMethod === "upi" ? styles.active : ""
          }`}
          onClick={() => setActiveMethod("upi")}
        >
        UPI
        </button>
      </div>

      <div
        id="upi-section"
        className={styles["payment-section"]}
        style={{ display: activeMethod === "upi" ? "block" : "none" }}
      >
        <p>Select UPI App:</p>
        <select>
          <option value="phonepe">PhonePe</option>
          <option value="gpay">Google Pay</option>
          <option value="paytm">Paytm</option>
        </select>
        <button
          className={styles["payment-btn"]}
          onClick={() => handlePayment("upi")}
        >
          Pay via UPI
        </button>
      </div>

      <div
        id="card-section"
        className={styles["payment-section"]}
        style={{ display: activeMethod === "card" ? "block" : "none" }}
      >
        <label>
          Card Number:<br />
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, cardNumber: e.target.value })
            }
          />
        </label>
        <br />
        <label>
          Card Holder Name:<br />
          <input
            type="text"
            placeholder="e.g, AB Deviliers"
            value={cardDetails.cardHolder}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, cardHolder: e.target.value })
            }
          />
        </label>
        <br />
        <label>
          CVV:<br />
          <input
            type="password"
            placeholder="123"
            value={cardDetails.cvv}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, cvv: e.target.value })
            }
          />
        </label>
        <br />
        <button
          className={styles["payment-btn"]}
          onClick={() => handlePayment("card")}
        >
          Pay via Card
        </button>
      </div>
    </div>
  );
};

export default PaymentInputs;
