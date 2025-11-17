import React, { useState } from 'react';
import classes from '../styles/header.module.css';
import NotificationSidebar from './NotificationSidebar';
import { Outlet } from 'react-router-dom';

// Removed unused icon URLs
const LOGO_URL = '/Assets/ADVANTAGE.png';

const Header = ({ isLogged, data, backendURL }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const profilePic = data?.buyer?.profilePicPath;

  return (
    <>
      <header>
        <nav className={classes.nav}>
          {/* === Box 1: Logo, Search, Seller, Login === */}
          <div className={classes.box1}>
            <div className={classes.logoImgWrapper}>
              <a href="/">
                <img src={LOGO_URL} alt="Logo" className={classes.logoImg} draggable="false" />
              </a>
            </div>

            <form className={classes.searchBox} action="/search/noFilter" method="get">
              <div className={classes.searchInput}>
                <i className={`bx bx-search-alt ${classes.magnifier}`}></i>
                <input
                  type="search"
                  name="search"
                  className={classes.searchProducts}
                  placeholder="Search"
                />
              </div>
            </form>

            <div className={`${classes.sellbtn} ${classes.hoverBtn}`}>
              <a href="/seller">Seller Account</a>
            </div>

            {isLogged ? (
              <div className={`${classes.loginBtn} ${classes.hoverBtn}`} style={{ display: 'none' }}>
                <a href="/auth/buyer">Login</a>
              </div>
            ) : (
              <div className={`${classes.loginBtn} ${classes.hoverBtn}`}>
                <a href="/auth/buyer">Login</a>
              </div>
            )}
          </div>

          {/* === User Actions: Icons === */}
          <div className={classes.userActions}>
            <div className={classes.box2}>
              {/* UPDATED: Changed from <img> to text */}
              <div className={`${classes.hover} ${classes.chaticon} ${classes.box2Icons}`}>
                <a href="/buyer/chats/buyerInbox">Chats</a>
              </div>
              {/* UPDATED: Changed from <img> to text */}
              <div className={`${classes.hover} ${classes.alert} ${classes.box2Icons}`}>
                <a href="#">Alerts</a>
              </div>
              {/* UPDATED: Changed from <img> to text */}
              <div className={`${classes.hover} ${classes.toggle} ${classes.box2Icons}`}>
                <a href="#">Toggle</a>
              </div>
            </div>

            <div className={classes.box3}>
              <div className={`${classes.hover} ${classes.box2Icons} ${classes.heart}`}>
                <a href="/buyer/wishlist"><i className='bx bx-heart'></i></a>
              </div>
              <div
                className={`${classes.hover} ${classes.box2Icons} ${classes.notifications} ${classes.alert}`}
                onClick={() => setIsSidebarOpen(true)}
              >
                {/* UPDATED: Changed from <img> to text */}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Notifications
                </a>
              </div>
              <div className={`${classes.hover} ${classes.box2Icons} ${classes.profile}`}>
                {profilePic ? (
                  <a href="/buyer/profile">
                    <img
                      src={`${backendURL}${profilePic}`}
                      alt="your profile pic"
                      height="50px"
                      width="50px"
                      style={{ borderRadius: '50%' }}
                    />
                  </a>
                ) : (
                  <a href="/buyer/profile"><i className='bx bxs-user-circle'></i></a>
                )}
              </div>
            </div>
          </div>

          {/* === Burger Menu (for mobile) === */}
          <div className={classes.burger}>
            <i className='bx bx-menu'></i>
          </div>
        </nav>
      </header>

      <NotificationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Outlet />
    </>
  );
};

export default Header;