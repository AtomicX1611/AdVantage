import React, { useState, useEffect } from 'react';
import styles from '../../styles/SellerTransactionPage.module.css';

const SellerTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    grossBuyerPayments: 0,
    settledEarnings: 0,
    pendingEarnings: 0,
    availableToWithdraw: 0,
    withdrawnToDate: 0,
    inProgressWithdrawals: 0,
    failedWithdrawals: 0,
  });
  const [filter, setFilter] = useState('all');
  const [payoutAccount, setPayoutAccount] = useState(null);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [formData, setFormData] = useState({
    accountType: 'bank',
    holderName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  });

  const fetchPayoutAccount = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/payout-account', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();
      if (data?.success) {
        setPayoutAccount(data.payoutAccount || null);
      }
    } catch (error) {
      console.error('Payout account fetch failed', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      let response = await fetch('http://localhost:3000/user/getMyTransactions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      const paymentLedger = data.paymentLedger || [];
      const payoutLedger = data.payoutLedger || [];
      const withdrawalLedger = data.withdrawalLedger || [];

      const combined = [...paymentLedger, ...payoutLedger, ...withdrawalLedger]
        .map((txn) => {
          const type = txn.ledgerType === 'withdrawal'
            ? 'withdrawal'
            : txn.ledgerType === 'payout'
              ? 'payout'
              : (txn.eventType === 'subscription' ? 'subscription' : 'payment');

          return {
            ...txn,
            type,
            signedAmount: txn.amountSign === '-' ? -Math.abs(txn.amount || 0) : Math.abs(txn.amount || 0),
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(combined);
      setSummary(data.summary || {
        grossBuyerPayments: 0,
        settledEarnings: 0,
        pendingEarnings: 0,
        availableToWithdraw: 0,
        withdrawnToDate: 0,
        inProgressWithdrawals: 0,
        failedWithdrawals: 0,
      });
    } catch (error) {
      console.error('Fetch Error:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchPayoutAccount();
  }, []);

  const handleSetupPayoutAccount = async (event) => {
    event.preventDefault();
    setIsSubmittingAccount(true);
    setActionMessage('');

    try {
      const response = await fetch('http://localhost:3000/user/payout-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!data.success) {
        setActionMessage(data.message || 'Unable to setup payout account.');
        return;
      }

      setActionMessage('Payout account setup complete. You can now withdraw finalized balance.');
      setShowPayoutForm(false);
      await fetchPayoutAccount();
    } catch (error) {
      console.error('Payout setup failed', error);
      setActionMessage('Payout setup failed. Please try again.');
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const handleWithdrawFinalizedBalance = async () => {
    setIsWithdrawing(true);
    setActionMessage('');

    try {
      const response = await fetch('http://localhost:3000/user/withdraw-finalized-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ transferMode: payoutAccount?.accountType === 'upi' ? 'UPI' : 'IMPS' }),
      });

      const data = await response.json();
      if (!data.success) {
        setActionMessage(data.message || 'Withdrawal failed');
        return;
      }

      setActionMessage('Withdrawal request processed successfully. Ledger has been refreshed.');
      await fetchTransactions();
    } catch (error) {
      console.error('Withdraw failed', error);
      setActionMessage('Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'payment': return <span className={`${styles.iconWrapper} ${styles.iconRent}`}>💳</span>;
      case 'payout': return <span className={`${styles.iconWrapper} ${styles.iconSale}`}>💰</span>;
      case 'withdrawal': return <span className={`${styles.iconWrapper} ${styles.iconSub}`}>🏦</span>;
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

    if (txn.type === 'withdrawal') {
      return `Destination: ${txn.counterparty || 'Payout account'}${txn.reason ? ` • ${txn.reason}` : ''}`;
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
        <p>Track payment events, finalized payouts, and withdrawn money with clear seller-focused status tracking.</p>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.accountStatus}>
          {payoutAccount
            ? `Payout destination: ${payoutAccount.accountType === 'upi' ? payoutAccount.upiId : `${payoutAccount.accountNumberMasked} (${payoutAccount.ifsc})`}`
            : 'No payout account configured yet.'}
        </div>
        {!payoutAccount && (
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={() => setShowPayoutForm((prev) => !prev)}
          >
            {showPayoutForm ? 'Close Setup Form' : 'Setup Payout Account'}
          </button>
        )}
        <button
          type="button"
          className={styles.withdrawActionBtn}
          onClick={handleWithdrawFinalizedBalance}
          disabled={!payoutAccount || Number(summary.availableToWithdraw || 0) <= 0 || isWithdrawing}
        >
          {isWithdrawing ? 'Processing...' : 'Withdraw Finalized Balance'}
        </button>
      </div>

      {actionMessage && <p className={styles.actionMessage}>{actionMessage}</p>}

      {showPayoutForm && !payoutAccount && (
        <form className={styles.payoutForm} onSubmit={handleSetupPayoutAccount}>
          <h3>One-Time Payout Setup</h3>
          <div className={styles.formRow}>
            <label>Account Type</label>
            <select
              value={formData.accountType}
              onChange={(event) => setFormData((prev) => ({ ...prev, accountType: event.target.value }))}
            >
              <option value="bank">Bank Account</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Holder Name</label>
            <input
              value={formData.holderName}
              onChange={(event) => setFormData((prev) => ({ ...prev, holderName: event.target.value }))}
              required
            />
          </div>

          {formData.accountType === 'bank' ? (
            <>
              <div className={styles.formRow}>
                <label>Account Number</label>
                <input
                  value={formData.accountNumber}
                  onChange={(event) => setFormData((prev) => ({ ...prev, accountNumber: event.target.value }))}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label>IFSC</label>
                <input
                  value={formData.ifsc}
                  onChange={(event) => setFormData((prev) => ({ ...prev, ifsc: event.target.value.toUpperCase() }))}
                  required
                />
              </div>
            </>
          ) : (
            <div className={styles.formRow}>
              <label>UPI ID</label>
              <input
                value={formData.upiId}
                onChange={(event) => setFormData((prev) => ({ ...prev, upiId: event.target.value }))}
                required
              />
            </div>
          )}

          <button type="submit" className={styles.primaryActionBtn} disabled={isSubmittingAccount}>
            {isSubmittingAccount ? 'Saving...' : 'Save Payout Account'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Buyer Payments (Events)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Rs. {Number(summary.grossBuyerPayments || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Finalized Payouts</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669' }}>Rs. {Number(summary.settledEarnings || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Available To Withdraw</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1d4ed8' }}>Rs. {Number(summary.availableToWithdraw || 0).toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.transactionCard} style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Withdrawn To Date</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f766e' }}>Rs. {Number(summary.withdrawnToDate || 0).toFixed(2)}</div>
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
        {['all', 'payment', 'payout', 'withdrawal', 'subscription'].map((type) => (
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