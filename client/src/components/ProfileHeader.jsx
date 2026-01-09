import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/profile.module.css";
import "boxicons/css/boxicons.min.css";

const ProfileHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.backIcon}>
        <Link to="/">
          <i className="bx bx-left-arrow-alt"></i>
        </Link>
      </div>
      <div className={styles.headerText}>
        <h1>Your Account</h1>
      </div>
    </div>
  );
};

export default ProfileHeader;
