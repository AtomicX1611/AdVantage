// src/pages/ManagerDashboard.jsx
import React from 'react';
import VerifyCard from '../components/Manager/VerifyCard.jsx';
import styles from '../styles/manager.module.css';

const dummyData = [
  {
    id: 1,
    productPhoto: 'https://via.placeholder.com/150',
    sellerName: 'Alice Smith',
    postingDate: '2023-10-01',
    category: 'Electronics',
    type: 'Sale',
    price: 500,
  },
  {
    id: 2,
    productPhoto: 'https://via.placeholder.com/150',
    sellerName: 'Bob Johnson',
    postingDate: '2023-10-05',
    category: 'Sports',
    type: 'Rental',
    price: 50,
  },
  {
    id: 3,
    productPhoto: 'https://via.placeholder.com/150',
    sellerName: 'Charlie Brown',
    postingDate: '2023-10-10',
    category: 'Photography',
    type: 'Sale',
    price: 300,
  },
  {
    id: 4,
    productPhoto: 'https://via.placeholder.com/150',
    sellerName: 'Dana White',
    postingDate: '2023-10-15',
    category: 'Outdoor',
    type: 'Rental',
    price: 100,
  },
];

const ManagerDashboard = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manager Dashboard</h1>
      <div className={styles.cardsGrid}>
        {dummyData.map((item) => (
          <VerifyCard
            key={item.id}
            productPhoto={item.productPhoto}
            sellerName={item.sellerName}
            postingDate={item.postingDate}
            category={item.category}
            type={item.type}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default ManagerDashboard;