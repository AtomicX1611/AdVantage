import React, { useState } from 'react';
import styles from '../../styles/manager.module.css';

const ComplaintList = ({ complaints, onResolve, onResolveEscrow }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('resolved');
  const [buyerRefundPercent, setBuyerRefundPercent] = useState('30');
  const [buyerRefundAmount, setBuyerRefundAmount] = useState('');
  const [sellerStakeReleaseAmount, setSellerStakeReleaseAmount] = useState('0');

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setResolutionText('');
    setSelectedStatus('resolved');
    setBuyerRefundPercent('30');
    setBuyerRefundAmount('');
    setSellerStakeReleaseAmount('0');
  };

  const handleResolve = (complaintId, type, actionType = null) => {
    if (type === 'product') {
      const payload = {
        actionType,
        resolution: resolutionText,
        sellerStakeReleaseAmount,
      };

      if (actionType === 'custom_split') {
        if (buyerRefundAmount) {
          payload.buyerRefundAmount = buyerRefundAmount;
        } else {
          payload.buyerRefundPercent = buyerRefundPercent;
        }
      }

      onResolveEscrow(complaintId, payload);
    } else {
      if (!selectedStatus) {
        alert('Please select a status');
        return;
      }
      onResolve(complaintId, selectedStatus, resolutionText);
    }
    setExpandedId(null);
    setResolutionText('');
    setBuyerRefundPercent('30');
    setBuyerRefundAmount('');
    setSellerStakeReleaseAmount('0');
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#fff3e0', color: '#e65100', label: 'Pending' },
      in_review: { bg: '#e3f2fd', color: '#1565c0', label: 'In Review' },
      resolved: { bg: '#e8f5e9', color: '#2e7d32', label: 'Resolved' },
      dismissed: { bg: '#fafafa', color: '#757575', label: 'Dismissed' },
    };
    const s = colors[status] || colors.pending;
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.color,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  if (!complaints || complaints.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📭</div>
        <h3 className={styles.emptyTitle}>No Complaints</h3>
        <p className={styles.emptyText}>
          There are no complaints in your category right now.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '0.4rem 1rem', background: '#fff3e0', borderRadius: '8px', fontSize: '0.85rem' }}>
          Pending: {complaints.filter(c => c.status === 'pending').length}
        </div>
        <div style={{ padding: '0.4rem 1rem', background: '#e3f2fd', borderRadius: '8px', fontSize: '0.85rem' }}>
          In Review: {complaints.filter(c => c.status === 'in_review').length}
        </div>
        <div style={{ padding: '0.4rem 1rem', background: '#e8f5e9', borderRadius: '8px', fontSize: '0.85rem' }}>
          Resolved: {complaints.filter(c => c.status === 'resolved').length}
        </div>
      </div>

      {complaints.map((complaint) => (
        <div
          key={complaint._id}
          style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '0.75rem',
            transition: 'box-shadow 0.2s',
            boxShadow: expandedId === complaint._id ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => handleToggle(complaint._id)}
          >
            <div>
              <h4 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>
                {complaint.subject}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                <strong>Product:</strong> {complaint.productId?.name || 'Unknown'} &nbsp;|&nbsp;
                <strong>By:</strong> {complaint.complainant?.username || 'Unknown'} ({complaint.complainant?.email || 'No email'}) &nbsp;|&nbsp;
                <strong>Type:</strong> {complaint.type === 'product' ? 'Product Related' : 'General'} &nbsp;|&nbsp;
                {complaint.respondent && (
                  <><strong>Against:</strong> {complaint.respondent?.username || 'N/A'} ({complaint.respondent?.email || 'No email'}) &nbsp;|&nbsp;</>
                )}
                <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {getStatusBadge(complaint.status)}
              <span style={{ fontSize: '1.2rem' }}>
                {expandedId === complaint._id ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {expandedId === complaint._id && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '0.75rem' }}>
                <strong>Description:</strong><br />
                {complaint.description}
              </p>

              {complaint.orderId && (
                <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '0.75rem' }}>
                  <strong>Order Context:</strong><br />
                  Amount: INR {typeof complaint.orderId.amount === 'number' ? (complaint.orderId.amount / 100).toFixed(2) : 'NA'} | Delivery: {complaint.orderId.deliveryStatus || 'NA'}
                </p>
              )}

              {complaint.attachments && complaint.attachments.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Proof Attachments:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {complaint.attachments.map((attachment, index) => (
                      <a
                        key={attachment.url || index}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '0.35rem 0.7rem',
                          border: '1px solid #d0d7de',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: '#1565c0',
                          textDecoration: 'none',
                          background: '#f8fafc',
                        }}
                      >
                        Proof {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {complaint.resolution && (
                <p style={{ fontSize: '0.9rem', color: '#2e7d32', marginBottom: '0.75rem' }}>
                  <strong>Resolution:</strong><br />
                  {complaint.resolution}
                </p>
              )}

              {(complaint.status === 'pending' || complaint.status === 'in_review') && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>
                      Resolution Note
                    </label>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Add resolution details..."
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        minHeight: '60px',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {complaint.type === 'product' ? (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>
                          Buyer Refund % (custom split)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={buyerRefundPercent}
                          onChange={(e) => setBuyerRefundPercent(e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', width: '160px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>
                          Buyer Refund Amount (optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={buyerRefundAmount}
                          onChange={(e) => setBuyerRefundAmount(e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', width: '180px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>
                          Seller Stake Release
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={sellerStakeReleaseAmount}
                          onChange={(e) => setSellerStakeReleaseAmount(e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', width: '180px' }}
                        />
                      </div>

                      <button
                        onClick={() => handleResolve(complaint._id, complaint.type, 'reject_dispute')}
                        style={{
                          padding: '0.55rem 1rem',
                          background: '#455a64',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        Reject Dispute
                      </button>
                      <button
                        onClick={() => handleResolve(complaint._id, complaint.type, 'refund_buyer')}
                        style={{
                          padding: '0.55rem 1rem',
                          background: '#2e7d32',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        Send Buyer Money
                      </button>
                      <button
                        onClick={() => handleResolve(complaint._id, complaint.type, 'custom_split')}
                        style={{
                          padding: '0.55rem 1rem',
                          background: '#1565c0',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        Send Seller Split + Stake
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.3rem' }}>
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '0.9rem',
                        }}
                      >
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                  )}
                  {complaint.type !== 'product' && (
                    <button
                      onClick={() => handleResolve(complaint._id, complaint.type)}
                      style={{
                        padding: '0.55rem 1.25rem',
                        background: '#1565c0',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      Update
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ComplaintList;
