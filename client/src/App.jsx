import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import SubscriptionPage from "./pages/Subscription.page";
import PaymentPage from "./pages/Payment.page.jsx";
import AppRoutes from './routes/AppRoutes.jsx'
import Navbar from './components/NavBar.jsx'

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
   <>
      <AppRoutes />
   </>
  )
}

export default App;
