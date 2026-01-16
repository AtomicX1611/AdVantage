import React, { useState } from 'react';
import classes from '../styles/header.module.css';
import NotificationSidebar from './NotificationSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Removed unused icon URLs
const LOGO_URL = '/Assets/ADVANTAGE.png';
const CHAT_ICON = '/Assets/chat.png';
const NOTIFICATION_ICON = '/Assets/notification.png';
const WISHLIST_ICON = '/Assets/wishlist.png';
const USER_ICON = '/Assets/user.png';

const Header = () => {
  const { isAuth, user } = useSelector((state) => state.auth);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const profilePic = user?.profilePicPath;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value.trim();
    if (searchValue) {
      navigate(`/search?query=${encodeURIComponent(searchValue)}`);
    }
  };

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

            <form className={classes.searchBox} onSubmit={handleSearchSubmit}>
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

            <div 
              className={`${classes.sellbtn} ${classes.hoverBtn}`}
              onClick={() => navigate('/seller/dashboard')}
              style={{ cursor: 'pointer' }}
            >
              <span>Seller Account</span>
            </div>

            {isAuth ? (
              <div className={`${classes.loginBtn} ${classes.hoverBtn}`} style={{ display: 'none' }}>
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Login</span>
              </div>
            ) : (
              <div className={`${classes.loginBtn} ${classes.hoverBtn}`}>
                <span onClick={() => navigate('/signup')} style={{ cursor: 'pointer' }}>Login</span>
              </div>
            )}
          </div>

          {/* === User Actions: Icons === */}
          <div className={classes.userActions}>
            <div className={classes.box2}>
              {/* UPDATED: Changed from <img> to text */}
              <div className={`${classes.hover} ${classes.chaticon} ${classes.box2Icons}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>
                  <img src={CHAT_ICON} alt="Chat" style={{ width: '28px', height: '28px' }} />
                </a>
              </div>
              {/* UPDATED: Changed from <img> to text */}
              {/* <div className={`${classes.hover} ${classes.alert} ${classes.box2Icons}`}>
                <a href="#">Alerts</a>
              </div> */}
              {/* UPDATED: Changed from <img> to text */}
              {/* <div className={`${classes.hover} ${classes.toggle} ${classes.box2Icons}`}>
                <a href="#">Toggle</a>
              </div> */}
            </div>

            <div className={classes.box3}>
              <div className={`${classes.hover} ${classes.box2Icons} ${classes.heart}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/wishlist'); }}>
                  <img src="/Assets/heartblack.png" alt="Wishlist" style={{ width: '28px', height: '28px' }} />
                </a>
              </div>
              <div
                className={`${classes.hover} ${classes.box2Icons} ${classes.notifications} ${classes.alert}`}
                onClick={() => setIsSidebarOpen(true)}
              >
                {/* UPDATED: Changed from <img> to text */}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <img src={NOTIFICATION_ICON} alt="Notifications" style={{ width: '28px', height: '28px' }} />
                </a>
              </div>
              <div className={`${classes.hover} ${classes.box2Icons} ${classes.profile}`}>
                {profilePic ? (
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
                    <img
                      src={`${backendURL}${profilePic}`}
                      alt="your profile pic"
                      height="28px"
                      width="28px"
                    />
                  </a>
                ) : (
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
                    <img src={USER_ICON} alt="User" style={{ width: '28px', height: '28px' }} />
                  </a>
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