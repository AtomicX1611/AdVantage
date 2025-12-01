import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "../pages/Home";
import HomeHeader from "../components/Header.jsx";
import ProductDetail from '../pages/ProductDetail'; 
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import Register from "../pages/Register";
import LoginPage from "../pages/LoginPage.jsx";
import Admin from "../pages/Admin";
import SubscriptionPage from "../pages/Subscription.page";
import PaymentPage from "../pages/Payment.page";
import Login from "../pages/Login";
import YourOrders from "../pages/YourOrders.page";
import ChatPage from "../pages/ChatPage";
import WishList from '../pages/WishlistPage.jsx';
import Profile from '../pages/Profile.jsx';
import AddProductForm from "../pages/AddProductForm.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import ViewRequest from "../pages/ViewRequest.jsx";
import ManagerDashboard from '../pages/ManagerDashboard.jsx';

const ProtectedRoute = ({ element }) => {
  // const { isAuth } = useSelector((state) => state.auth);
  // return isAuth ? element : <Navigate to="/login" replace />;
  return element;
};

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
];

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<HomeHeader />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="product/:pid" element={<ProductDetailPage />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          {/* Protected User Routes */}
          <Route path="profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="chat" element={<ProtectedRoute element={<ChatPage />} />} />
          <Route path="wishlist" element={<ProtectedRoute element={<WishList />} />} />
          <Route path="my-orders" element={<ProtectedRoute element={<YourOrders />} />} />
          <Route path="add-new-product" element={<ProtectedRoute element={<AddProductForm />} />} />
          <Route path="product-requests" element={<ProtectedRoute element={<ViewRequest />} />} />
          <Route path="pending-payment/:id" element={<h1>New page pipeline to be decided yet</h1>} />
          <Route path="seller/subscription/vip"
            element={
              <PaymentPage 
                type={subsData[0].type} 
                duration={subsData[0].duration} 
                Price={subsData[0].price} 
                validTill={new Date(new Date().setMonth(new Date().getMonth() + 1)).toDateString()}
              />
            }
          />
          <Route path="seller/subscription/premium"
            element={
              <PaymentPage 
                type={subsData[1].type} 
                duration={subsData[1].duration} 
                Price={subsData[1].price} 
                validTill={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toDateString()}
              />
            }
          />
        </Route>

        <Route path="/admin" element={<Admin />} />
        <Route path="/manager" element={<ManagerDashboard />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;