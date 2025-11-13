import React from "react";
import styles from "../styles/header.module.css";

/**
 * UserActions is a pure presentational component.
 * toggleSidebar prop is a function that opens notification sidebar.
 */
const UserActions = ({ toggleSidebar = () => {} }) => {
  return (
    <>
      <div className={styles["box2"]}>
        <div className={`${styles["hover"]} ${styles["chaticon"]} ${styles["box2-icons"]}`}>
          <a href="/buyer/chats/buyerInbox">
            <img src="/Assets/Commentblack.png" alt="chat" />
          </a>
        </div>

        <div className={`${styles["hover"]} ${styles["alert"]} ${styles["box2-icons"]}`}>
          <a href="#">
            <img src="/Assets/Alarmblack.png" alt="alarm" />
          </a>
        </div>

        <div className={`${styles["hover"]} ${styles["toggle"]} ${styles["box2-icons"]}`}>
          <a href="#">
            <img src="/Assets/Toggleblack.png" alt="toggle" />
          </a>
        </div>
      </div>

      <div className={styles["box3"]}>
        <div className={`${styles["hover"]} ${styles["box2-icons"]} ${styles["heart"]}`}>
          <a href="/buyer/wishlist">
            <i className="bx bx-heart"></i>
          </a>
        </div>

        <div
          id="notification-icon" /* keep id so any scripts can select it if needed */
          className={`${styles["hover"]} ${styles["box2-icons"]} ${styles["notifications"]} ${styles["alert"]}`}
          onClick={toggleSidebar}
        >
          <a href="#">
            <img src="/Assets/Notificationblacl.png" alt="notification" height="35px" />
          </a>
        </div>

        <div className={`${styles["hover"]} ${styles["box2-icons"]} ${styles["profile"]}`}>
          <a href="/buyer/profile">
            <i className="bx bxs-user-circle"></i>
          </a>
        </div>
      </div>
    </>
  );
};

export default UserActions;
