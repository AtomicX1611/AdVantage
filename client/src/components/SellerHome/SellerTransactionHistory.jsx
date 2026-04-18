import React, { useState, useEffect } from 'react';
import styles from '../../styles/SellerTransactionPage.module.css';

const SellerTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    grossBuyerPayments: 0,
    settledEarnings: 0,
    pendingEarnings: 0,
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchTxn() {
      try {
        let response = await fetch('http://localhost:3000/user/getMyTransactions', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data = await response.json();

        const paymentLedger = data.paymentLedger || [];
        const payoutLedger = data.payoutLedger || [];

        const combined = [...paymentLedger, ...payoutLedger]
          .map((txn) => ({
            ...txn,
            type: txn.ledgerType === 'payout'
              ? 'payout'
              : (txn.eventType === 'subscription' ? 'subscription' : 'payment'),
            signedAmount: txn.amountSign === '-' ? -Math.abs(txn.amount || 0) : Math.abs(txn.amount || 0),
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(combined);
        setSummary(data.summary || {
          grossBuyerPayments: 0,
          settledEarnings: 0,
          pendingEarnings: 0,
        });
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    }
    fetchTxn();
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'payment': return <span className={`${styles.iconWrapper} ${styles.iconRent}`}>💳</span>;
      case 'payout': return <span className={`${styles.iconWrapper} ${styles.iconSale}`}>💰</span>;
      case 'subscription': return <span className={`${styles.iconWrapper} ${styles.iconSub}`}>💳</span>;
      default: return <span className={styles.iconWrapper}>📄</span>;
    }
  };

  const getStatusClass = (statusClass) => {
    if (statusClass === 'failed') return styles.statusFailed;
    if (statusClass === 'pending') return styles.statusPending;
    return styles.statusSuccess;
  };

  const renderMetaText = (txn) => {
    if (txn.type === 'payout') {
      return txn.reason || 'Settlement ledger entry';
    }

    if (txn.type === 'subscription') {
      return `Paid to ${txn.counterparty || 'Platform'}`;
    }

    return `${txn.counterparty ? `From: ${txn.counterparty}` : 'Buyer Payment Event'}${txn.orderDeliveryStatus ? ` • Order: ${txn.orderDeliveryStatus}` : ''}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Transaction History</h2>
        <p>Payments and settlements are shown separately so realized earnings stay accurate.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Buyer Payments (Events)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Rs. {Number(summary.grossBuyerPayments || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Settled Earnings</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669' }}>Rs. {Number(summary.settledEarnings || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pending Settlement</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#d97706' }}>Rs. {Number(summary.pendingEarnings || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className={styles.filterContainer}>
        {['all', 'payment', 'payout', 'subscription'].map((type) => (
          <button
            key={type}
            className={`${styles.filterBtn} ${filter === type ? styles.activeFilter : ''}`}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
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
                    {renderMetaText(txn)}
                  </p>
                </div>
              </div>

              <div className={styles.cardRight}>
                <span className={`${styles.amount} ${txn.signedAmount > 0 ? styles.amountPositive : styles.amountNegative}`}>
                  {txn.signedAmount > 0 ? '+' : ''} Rs.{Math.abs(txn.signedAmount).toFixed(2)}
                </span>
                <span className={`${styles.statusBadge} ${getStatusClass(txn.statusClass)}`}>
                  {txn.displayStatus || 'Recorded'}
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