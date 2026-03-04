import React, { useState,useEffect } from 'react';
import styles from '../../styles/SellerTransactionPage.module.css';

// --- DUMMY DATA ---
const TRANSACTIONS_DATA = [
  {
    id: 'TXN_101',
    title: 'Sold: testProduct3',
    date: '2023-10-25',
    amount: 198.00,
    type: 'sale', // Options: sale, rent, subscription
    status: 'success',
    buyer: 'muzammil'
  },
  {
    id: 'TXN_102',
    title: 'Monthly VIP Subscription',
    date: '2023-10-20',
    amount: -100.00 , // Negative for expense
    type: 'subscription',
    status: 'success',
    buyer: 'Platform Fee'
  },
  {
    id: 'TXN_103',
    title: 'Sold: testProduct4',
    date: '2023-10-18',
    amount: 198.00,
    type: 'sale',
    status: 'success',
    buyer: 'sk'
  },
  {
    id: 'TXN_104',
    title: 'Sold: test4',
    date: '2023-10-15',
    amount: 123.00,
    type: 'sale',
    status: 'success',
    buyer: 'muzammil'
  },
  {
    id: 'TXN_105',
    title: 'Sold: for sale',
    date: '2023-10-10',
    amount: 1200.00,
    type: 'sale',
    status: 'success',
    buyer: 'Jane Doe'
  }
];

const SellerTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(()=> {
    async function fetchTxn() {
        let response = await fetch('http://localhost:3000/user/getMyTransactions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        let data = await response.json();
        console.log("txn data",data);
        if(data.success) {  
            const txn = [];
            txn.push(data.paidTo);
            txn.push(data.received);

            setTransactions(txn);
        } 
    }
    fetchTxn();
  },[])
  // Filter Logic
  const filteredTransactions = TRANSACTIONS_DATA.filter((txn) => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  // Helper to get Icon based on type
  const getIcon = (type) => {
    switch (type) {
      case 'sale': return <span className={`${styles.iconWrapper} ${styles.iconSale}`}>💰</span>;
      case 'rent': return <span className={`${styles.iconWrapper} ${styles.iconRent}`}>⏱️</span>;
      case 'subscription': return <span className={`${styles.iconWrapper} ${styles.iconSub}`}>💳</span>;
      default: return <span className={styles.iconWrapper}>📄</span>;
    }
  };

  // Helper for Status Badge Class
  const getStatusClass = (status) => {
    switch (status) {
      case 'success': return styles.statusSuccess;
      case 'pending': return styles.statusPending;
      case 'failed': return styles.statusFailed;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Transaction History</h2>
        <p>View all your earnings, rentals, and subscription payments.</p>
      </div>

      {/* --- FILTER TABS --- */}
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

      {/* --- TRANSACTION LIST --- */}
      <div className={styles.transactionList}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((txn) => (
            <div key={txn.id} className={styles.transactionCard}>
              
              {/* Left: Icon + Text */}
              <div className={styles.cardLeft}>
                {getIcon(txn.type)}
                <div className={styles.details}>
                  <h4>{txn.title}</h4>
                  <p>
                    {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                    {' • '} 
                    {txn.type === 'subscription' ? 'Paid to Platform' : `From: ${txn.buyer}`}
                  </p>
                </div>
              </div>

              {/* Right: Amount + Status */}
              <div className={styles.cardRight}>
                <span className={`${styles.amount} ${txn.amount > 0 ? styles.amountPositive : styles.amountNegative}`}>
                  {txn.amount > 0 ? '+' : ''} Rs{Math.abs(txn.amount).toFixed(2)}
                </span>
                <span className={`${styles.statusBadge} ${getStatusClass(txn.status)}`}>
                  {txn.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No transactions found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerTransactionHistory;