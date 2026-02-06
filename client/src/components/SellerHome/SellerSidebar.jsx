import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../../styles/sellerdashboard.module.css';

const SellerSidebar = ({ isOpen }) => {
  // Helper to apply active style
  const getLinkClass = ({ isActive }) =>
    `${styles.sidebarLink} ${isActive ? styles.activeLink : ''}`;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
      <NavLink to="/seller/dashboard" end className={getLinkClass}>
        Analytics Overview
      </NavLink>
      <NavLink to="for-sale" className={getLinkClass}>Items For Sale</NavLink>
      <NavLink to="for-rent" className={getLinkClass}>Items For Rent</NavLink>
      <NavLink to="requests" className={getLinkClass}>Buyer Requests</NavLink>
      <NavLink to="accepted-pending" className={getLinkClass}>Accepted - Awaiting Payment</NavLink>
      <NavLink to="sold" className={getLinkClass}>Sold Items</NavLink>
      <NavLink to="rented-out" className={getLinkClass}>Currently Rented Out</NavLink>
    </aside>
  );
};

export default SellerSidebar;