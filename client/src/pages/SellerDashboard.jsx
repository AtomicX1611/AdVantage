import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerSidebar from '../components/SellerHome/SellerSidebar.jsx';
import styles from '../styles/sellerdashboard.module.css';

const SellerLayout = () => {
  const isSidebarOpen = true;

  return (
    <div className={styles.container}>
      <div className={styles.mainBody}>
        <SellerSidebar isOpen={isSidebarOpen} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;