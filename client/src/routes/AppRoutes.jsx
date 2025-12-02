import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "../pages/Home";
import HomeHeader from "../components/Header.jsx";
import ProductDetail from '../pages/ProductDetail';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import Register from "../pages/Register";
// import LoginPage from "../pages/LoginPage.jsx";
// import Admin from "../pages/Admin.jsx";
import Admin from "../pages/AdminPage.jsx";
import SubscriptionPage from "../pages/Subscription.page.jsx";
import PaymentPage from "../pages/Payment.page.jsx";
// import Login from "../pages/Login.jsx";
import YourOrders from "../pages/YourOrders.page";
import ChatPage from "../pages/ChatPage";
import WishList from '../pages/WishlistPage.jsx';
import Profile from '../pages/Profile.jsx';
import UserUpdateProfile from '../pages/userUpdateProfile.jsx';
import AddProductForm from "../pages/AddProductForm.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import ViewRequest from "../pages/ViewRequest.jsx";
import PendingTxsPage from "../pages/PendingTxsPage.jsx";
import ManagerDashboard from '../pages/ManagerDashboard.jsx';
import SellerDashboardLayout from "../pages/SellerDashboard.jsx";
import SellerItems from "../components/SellerHome/SellerItems";
import SellerRequests from "../components/SellerHome/SellerRequests";
import AcceptedProducts from "../components/SellerHome/AcceptedProducts";
import SellerHeaderLayout from "../components/SellerHome/SellerHeaderLayout.jsx"
import LoginPage from "../components/TempLogin.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";


const ProtectedRoute = ({ element }) => {
  // const { isAuth } = useSelector((state) => state.auth);
  // return isAuth ? element : <Navigate to="/login" replace />;
  return element;
};

const subsData = [
  {
    type: "vip",
    duration: "6 Months",
    price: "100",
  },
  {
    type: "premium",
    duration: "1 year",
    price: "1299",
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
          {/* Protected User Routes */}
          <Route path="profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="updateProfile" element={<ProtectedRoute element={<UserUpdateProfile />} />} />
          <Route path="chat" element={<ProtectedRoute element={<ChatPage />} />} />
          <Route path="wishlist" element={<ProtectedRoute element={<WishList />} />} />
          <Route path="yourProducts" element={<ProtectedRoute element={<YourOrders />} />} />
          <Route path="product-requests" element={<ProtectedRoute element={<ViewRequest />} />} />
          <Route path="pending-transactions" element={<ProtectedRoute element={<PendingTxsPage />} />} />
          <Route path="pending-payment/:id" element={<h1>New page pipeline to be decided yet</h1>} />
        </Route>
        {/* for seller Dashboard */}
        <Route path="/seller/dashboard" element={<ProtectedRoute element={<SellerDashboardLayout />} />}>
          <Route index element={<Navigate to="for-sale" replace />} />
          <Route path="for-sale" element={<SellerItems filterType="sale" />} />
          <Route path="for-rent" element={<SellerItems filterType="rent" />} />
          <Route path="sold" element={<SellerItems filterType="sold" />} />
          <Route path="rented-out" element={<SellerItems filterType="rented" />} />
          <Route path="requests" element={<SellerRequests />} />
          <Route path="accepted-pending" element={<AcceptedProducts />} />
        </Route>

        <Route path="/seller" element={<SellerHeaderLayout />}>
          {/* add routes for add product form , inbox, and /seller/dashboard with root elemetn as SellerLayout*/}
          <Route path="add-new-product" element={<ProtectedRoute element={<AddProductForm />} />} />
          <Route path="chat" element={<ProtectedRoute element={<ChatPage />} />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="dashboard" element={<ProtectedRoute element={<SellerDashboardLayout />} />} />

          <Route path="subscription/vip"
            element={
              <PaymentPage
                type={subsData[0].type}
                duration={subsData[0].duration}
                Price={subsData[0].price}
                validTill={new Date(new Date().setMonth(new Date().getMonth() + 1)).toDateString()}
              />
            }
          />
          <Route path="subscription/premium"
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
        <Route path="/error" element={<ErrorPage />} />


      </Routes>
    </Router>
  );
};

export default AppRoutes;