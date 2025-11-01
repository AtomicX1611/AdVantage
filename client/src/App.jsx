// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import SubscriptionPage from "./pages/Subscription.page";
import PaymentPage from "./pages/Payment.page.jsx";
const subsData = [
  {
    type: "vip",
    duration: "6 Months",
    price: "$29.99",
  },
  {
    type: "premium",
    duration: "1 year",
    price: "$79.99",
  }
]

const App = () => {
  return (
    <Routes>
      <Route path="/subscription" element={<SubscriptionPage />} />

      <Route path="/seller/subscription/vip" element={<PaymentPage type={subsData[0].type} duration={subsData[0].duration} Price={subsData[0].price} validTill={new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ).toDateString()} />} />

      <Route path="/seller/subscription/premium" element={<PaymentPage type={subsData[1].type} duration={subsData[1].duration} Price={subsData[1].price} validTill={new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toDateString()} />} />
    </Routes>
  );
};

export default App;
