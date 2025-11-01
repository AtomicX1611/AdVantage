import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "../pages/Home";
import ProductDetail from '../pages/ProductDetail';
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Manager from "../pages/Manager";
import SubscriptionPage from "../pages/Subscription.page";
import PaymentPage from "../pages/Payment.page";
import Login from "../pages/Login";

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


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/profile" element={<h1>Profile page</h1>} />
        <Route path="/chat" element={<h1>Chat page</h1>} />
        <Route path="/wishlist" element={<h1>Wish list page</h1>} />
        <Route path="/search" element={<h1>Search page</h1>} />
        {/* Basic route to navigte , use search query and params as required*/}
        <Route path="/my-orders" element={<h1>Your orders page</h1>} />

        <Route path="/add-new-product" element={<h1>Add product form</h1>} />

        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/seller/subscription/vip"
          element={
            <PaymentPage type={subsData[0].type} duration={subsData[0].duration} Price={subsData[0].price} validTill={new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toDateString()}
            />}
        />
        <Route path="/seller/subscription/premium"
          element={
            <PaymentPage type={subsData[1].type} duration={subsData[1].duration} Price={subsData[1].price} validTill={new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ).toDateString()}
            />}
        />

        <Route path="/product-requests" element={<h1>View Requests page</h1>}/>
        <Route path="/pending-payment/:id" element={<h1>New page pipeline to be decided yet</h1>}/>
        <Route path='/product/:pid' element={<ProductDetail />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/manager' element={<Manager />} />
      </Routes>
    </Router>
  )
}

export default AppRoutes
