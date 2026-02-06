import React from "react";
import styles from "../styles/header.module.css";

const LogoSection = () => {
  return (
    <div className={styles["logo-img-wrapper"]}>
      <a href="/">
        <img
          src="/Assets/ADVANTAGE.png"
          alt="Logo"
          className={styles["logo-img"]}
          draggable="false"
        />
      </a>
    </div>
  );
};

export default LogoSection;
