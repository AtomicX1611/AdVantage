import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SellerHeader from '../components/SellerHome/SellerHeader';
import SellerSidebar from '../components/SellerHome/SellerSidebar.jsx';
import styles from '../styles/sellerdashboard.module.css';

const SellerLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.container}>
      <SellerHeader toggleSidebar={toggleSidebar} />

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