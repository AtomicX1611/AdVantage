// src/pages/SubscriptionPage.jsx
import React from "react";
import classes from "../styles/sellerSubscription.module.css";
import SubscriptionBox from "../components/SubscriptionBox.component.jsx";
import { useEffect,useState } from "react";
import API_CONFIG from "../config/api.config";
import { startRazorpayPayment } from "../utils/razorpay";

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(0);  
  const [isPaying, setIsPaying] = useState(false);
  const backendURL = API_CONFIG.BACKEND_URL;
  // Example: fetched from backend (0 = Basic, 1 = VIP, 2 = Premium)

  useEffect(() => {
    async function fetchCurrentPlan() {
      const response = await fetch(`${backendURL}/user/subscriptionStatus`, {
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
  }, [backendURL]);

  const handleSubscribe = async (plan) => {
    if (isPaying) {
      return;
    }

    try {
      setIsPaying(true);

      await startRazorpayPayment({
        backendURL,
        createOrderPayload: { subscription: plan.id },
        displayName: "AdVantage",
        description: `${plan.name} subscription payment`,
      });

      setCurrentPlan(plan.id);
      alert("Subscription updated successfully");
    } catch (error) {
      console.error("Subscription payment failed", error);
      alert(error.message || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

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
            onSubscribe={handleSubscribe}
            isPaying={isPaying}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
