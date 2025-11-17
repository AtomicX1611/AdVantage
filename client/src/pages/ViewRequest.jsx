// src/pages/ViewRequest.jsx
import React from 'react';
import RequestCard from '../Components/ViewRequest/RequestCard.jsx';
import styles from '../styles/viewrequest.module.css';

const dummyRequests = [
  {
    id: 1,
    productPhoto: 'https://sm.pcmag.com/pcmag_au/photo/m/msi-titan-/msi-titan-18-hx_r2s9.jpg',
    productName: 'Laptop',
    requesterName: 'John Doe',
    isRental: false,
    priceBid: 500,
  },
  {
    id: 2,
    productPhoto: 'https://via.placeholder.com/150',
    productName: 'Bicycle',
    requesterName: 'Jane Smith',
    isRental: true,
    fromDate: '2023-10-01',
    toDate: '2023-10-07',
  },
  {
    id: 3,
    productPhoto: 'https://via.placeholder.com/150',
    productName: 'Camera',
    requesterName: 'Alice Johnson',
    isRental: false,
    priceBid: 300,
  },
  {
    id: 4,
    productPhoto: 'https://via.placeholder.com/150',
    productName: 'Tent',
    requesterName: 'Bob Brown',
    isRental: true,
    fromDate: '2023-11-15',
    toDate: '2023-11-20',
  },
];

const ViewRequest = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>View Requests</h1>
      <div className={styles.requestsGrid}>
        {dummyRequests.map((request) => (
          <RequestCard
            key={request.id}
            productPhoto={request.productPhoto}
            productName={request.productName}
            requesterName={request.requesterName}
            isRental={request.isRental}
            priceBid={request.priceBid}
            fromDate={request.fromDate}
            toDate={request.toDate}
          />
        ))}
      </div>
    </div>
  );
};

export default ViewRequest;