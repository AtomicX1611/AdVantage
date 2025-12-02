import React, { useState } from "react";
// import HomeHeader from "../components/HomeHeader";
import ProfileHeader from "../components/ProfileHeader";
import ProfileOptionsList from "../components/ProfileOptionList";
import styles from "../styles/profile.module.css";

const Profile = () => {
  // dummy options data
  const [options] = useState([
    {
      title: "Login and Security",
      icon: "bxs-lock",
      link: "/updatePassword",
    },
    {
      title: "Pending Transactions",
      icon: "bxs-hourglass-top",
      link: "/pending-transactions",
    },
    {
      title: "Your Orders",
      icon: "bx-package",
      link: "/yourProducts",
    },
    {
      title: "Change/Add your profile",
      icon: "",
      link: "/updateProfile",
    },
    {
      title: "Logout",
      icon: "",
      link: "/logout",
    },
    {
      title: "Your Seller Account",
      icon: "",
      link: "/seller/dashboard",
    },
  ]);

  return (
    <div className={styles.window}>
      {/* <HomeHeader /> */}
      <div className={styles.mainContainer}>
        <ProfileHeader />
        <ProfileOptionsList options={options} />
      </div>
    </div>
  );
};

export default Profile;
