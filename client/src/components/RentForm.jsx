import React, { useState } from "react";
import styles from "../styles/productdetails.module.css";

const RentForm = ({ onClose, onSubmit }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSubmit = () => {
    if (!fromDate || !toDate) return alert("Please fill both dates");
    if (fromDate >= toDate)
      return alert("From date must be earlier than To date");
    onSubmit(fromDate, toDate);
  };

  return (
    <div id="rentRequestForm">
      <button id="xBtn" onClick={onClose}>
        X
      </button>
      <label htmlFor="fromDate">From:</label>
      <input
        type="date"
        id="fromDate"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
      <label htmlFor="toDate">To:</label>
      <input
        type="date"
        id="toDate"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
      <button id="submitBtnRent" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default RentForm;
