import React, { useState, useEffect } from 'react';
import styles from '../../styles/SellerTransactionPage.module.css';
import API_CONFIG from '../../config/api.config';

const BACKEND = (API_CONFIG.BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const SellerTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  // 1. Fetch the data
  useEffect(() => {
    async function fetchTxn() {
      try {
        let response = await fetch(`${BACKEND}/user/getMyTransactions`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        let data = await response.json();
        console.log("1. API data received:", data);

        // Some endpoints may not use `success` field consistently
        // so proceed to normalize whatever transaction arrays are present.
        // This also ensures we set state even when `success` is missing.
        // Normalize only when we have arrays (or empty arrays) to avoid
        // leaving the component stuck with the initial empty state.
        // Continue regardless of `data.success` value.
        
        // fallbacks
        const receivedArr = data.received || data.receipts || [];
        const paidArr = data.paidTo || data.paid || [];

        // Log what arrays we'll normalize
        console.log('receivedArr length:', (receivedArr || []).length, 'paidArr length:', (paidArr || []).length);

        // Normalize and set state below
        
        if (receivedArr || paidArr) {
          // Normalize Received (Incomes)
          const received = (receivedArr || []).map(item => ({
            id: item._id,
            title: item.paymentType === 'purchase' ? 'Item Sold' : 'Item Rented',
            date: item.date,
            amount: item.price,
            type: item.paymentType === 'purchase' ? 'sale' : 'rent',
            status: 'success',
            buyer: item.from?.username || 'Gamer'
          }));

          // Normalize PaidTo (Expenses)
          const paid = (paidArr || []).map(item => ({
            id: item._id,
            title: 'Platform Subscription',
            date: item.date,
            amount: -item.price,
            type: 'subscription',
            status: 'success',
            buyer: 'Platform'
          }));

          const allTransactions = [...received, ...paid];

          console.log('2. Normalized transactions ready to set:', allTransactions);

          // Use a fresh array reference to guarantee React updates
          setTransactions([...allTransactions]);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    }
    fetchTxn();
  }, []);

  useEffect(() => {
    console.log("2. Transactions state officially updated:", transactions);
  }, [transactions]);

  // Filter Logic
  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'sale': return <span className={`${styles.iconWrapper} ${styles.iconSale}`}>💰</span>;
      case 'rent': return <span className={`${styles.iconWrapper} ${styles.iconRent}`}>⏱️</span>;
      case 'subscription': return <span className={`${styles.iconWrapper} ${styles.iconSub}`}>💳</span>;
      default: return <span className={styles.iconWrapper}>📄</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Transaction History</h2>
        <p>View your earnings and activity.</p>
      </div>

      <div className={styles.filterContainer}>
        {['all', 'sale', 'rent', 'subscription'].map((type) => (
          <button
            key={type}
            className={`${styles.filterBtn} ${filter === type ? styles.activeFilter : ''}`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}s
          </button>
        ))}
      </div>

      <div className={styles.transactionList}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((txn, idx) => (
            <div key={`${txn.id || txn.title}-${idx}`} className={styles.transactionCard}>
              <div className={styles.cardLeft}>
                {getIcon(txn.type)}
                <div className={styles.details}>
                  <h4>{txn.title}</h4>
                  <p>
                    {new Date(txn.date).toLocaleDateString()} 
                    {' • '} 
                    {txn.type === 'subscription' ? 'Paid to Platform' : `From: ${txn.buyer}`}
                  </p>
                </div>
              </div>

              <div className={styles.cardRight}>
                <span className={`${styles.amount} ${txn.amount > 0 ? styles.amountPositive : styles.amountNegative}`}>
                  {txn.amount > 0 ? '+' : ''} Rs.{Math.abs(txn.amount).toFixed(2)}
                </span>
                <span className={`${styles.statusBadge} ${styles.statusSuccess}`}>
                  Success
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No transactions found for this view.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerTransactionHistory;