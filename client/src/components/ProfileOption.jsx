import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/profile.module.css";
import "boxicons/css/boxicons.min.css";

const ProfileOption = ({ title, icon, link }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Get all cookies and delete them
    // console.log("fdskhf");
    await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/logout", {
      method: "DELETE",
      credentials: "include",
    });
    // Redirect to home or login page
    document.location.href = "/";
  };

  // Handle logout specially
  if (link === "/logout") {
    return (
      <div onClick={handleLogout} style={{ cursor: "pointer" }}>
        <div className={styles['data-box']}>
          <div className={styles['section-text']}>
            <h1>
              {title} {icon && <i className={`bx ${icon}`}></i>}
            </h1>
          </div>
        </div>
      </div>
    );
  }

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
