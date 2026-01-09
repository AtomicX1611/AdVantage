// src/pages/SubscriptionPage.jsx
import React from "react";
import classes from "../styles/sellerSubscription.module.css";
import SubscriptionBox from "../components/SubscriptionBox.component.jsx";
import { useEffect,useState } from "react";

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(0);  
  // Example: fetched from backend (0 = Basic, 1 = VIP, 2 = Premium)

  useEffect(() => {
    async function fetchCurrentPlan() {
      const response = await fetch('http://localhost:3000/user/subscriptionStatus', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' 
      });
      const data = await response.json();
      console.log("data: ",data);
      if(data.success) {
        setCurrentPlan(data.subscription);
      }
    }
    fetchCurrentPlan();
  }, []);

  const plans = [
    {
      id: 0,
      name: "Basic Plan",
      price: "Free",
      posts: "15 Posts/Month",
      features: [
        "Fresh Recommendations",
        "No Ads shown",
        "No Featured Promotion",
      ],
      link: null,
    },
    {
      id: 1,
      name: "VIP",
      price: "₹100 / Month",
      posts: "50 Posts/Month",
      features: [
        "Fresh Recommendations",
        "Your products in Featured Recommendations",
        "No ads Shown",
      ],
      link: "/seller/subscription/vip",
    },
    {
      id: 2,
      name: "Premium",
      price: "₹1299 / Year",
      posts: "100 Posts/Month",
      features: [
        "Fresh Recommendations",
        "Your products in Featured Recommendations",
        "No ads Shown",
      ],
      link: "/seller/subscription/premium",
    },
  ];

  return (
    <div className={classes["subs-container"]}>
      <h1>Pricing & Subscriptions</h1>
      <div className={classes.wrapper}>
        {plans.map((plan) => (
          <SubscriptionBox
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
