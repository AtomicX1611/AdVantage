import React from 'react';
import styles from '../styles/home.module.css';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={styles.icon} id={category.id}>
        <img src={category.image} alt={category.name} />
      </div>
      <div className={styles.iconText}>
        <h3>{category.name}</h3>
      </div>
    </div>
  );
};

export default CategoryCard;
