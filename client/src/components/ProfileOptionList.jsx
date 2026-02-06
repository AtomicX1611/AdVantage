import React from "react";
import ProfileOption from "./ProfileOption";
import styles from "../styles/profile.module.css";

const ProfileOptionsList = ({ options }) => {
  return (
    <div className={styles['user-data']}>
      {options.map((opt, idx) => (
        <ProfileOption key={idx} title={opt.title} icon={opt.icon} link={opt.link} />
      ))}
    </div>
  );
};

export default ProfileOptionsList;
