import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/profile.module.css";
import "boxicons/css/boxicons.min.css";

const ProfileOption = ({ title, icon, link }) => {
  return (
    <Link to={link}>
      <div className={styles['data-box']}>
        <div className={styles['section-text']}>
          <h1>
            {title} {icon && <i className={`bx ${icon}`}></i>}
          </h1>
        </div>
      </div>
    </Link>
  );
};

export default ProfileOption;
