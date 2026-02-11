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
import SellerAnalytics from '../components/SellerHome/SellerAnalytics.jsx'
import SellerHeaderLayout from "../components/SellerHome/SellerHeaderLayout.jsx"
import LoginPage from "../components/TempLogin.jsx";
import AuthLogin from "../pages/AuthLogin.jsx";
import AuthSignup from "../pages/AuthSignup.jsx";
import UpdatePassword from "../pages/UpdatePassword.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess,logout } from '../redux/authSlice';
import TestLogin from "../testLogin.jsx";


const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isAuth, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>; // or spinner
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is allowed
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on their role
      if (userRole === 'admin') return <Navigate to="/admin" replace />;
      if (userRole === 'manager') return <Navigate to="/manager" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return element;
};

const subsData = [
  {
    type: "vip",
    subscription : 1,
    duration: "6 Months",
    price: "100",
  },
  {
    type: "premium",
    duration: "1 year",
    subscription:2,
    price: "1299",
  }
];

const AppRoutes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const saveUserInfoToStore = async () => {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/auth/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        dispatch(logout());
      }else{
        dispatch(
          loginSuccess({
            email: data.info.email,
            id: data.info._id,
            role: data.info.role,
            profilePicPath: data.info.profilePicPath,
          })
        );
      }
    };

    saveUserInfoToStore();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeHeader />}>
          <Route index element={<Home />} />
          <Route path="test" element={<TestLogin/>}/>
          <Route path="search" element={<SearchPage />} />
          <Route path="product/:pid" element={<ProductDetailPage />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<AuthLogin />} />
          <Route path="signup" element={<AuthSignup />} />
          {/* Protected User Routes - only normal users */}
          <Route path="updatePassword" element={<ProtectedRoute element={<UpdatePassword />} allowedRoles={['user']} />} />
          <Route path="profile" element={<ProtectedRoute element={<Profile />} allowedRoles={['user']} />} />
          <Route path="updateProfile" element={<ProtectedRoute element={<UserUpdateProfile />} allowedRoles={['user']} />} />
          <Route path="chat" element={<ProtectedRoute element={<ChatPage />} allowedRoles={['user']} />} />
          <Route path="wishlist" element={<ProtectedRoute element={<WishList />} allowedRoles={['user']} />} />
          <Route path="yourProducts" element={<ProtectedRoute element={<YourOrders />} allowedRoles={['user']} />} />
          <Route path="product-requests" element={<ProtectedRoute element={<ViewRequest />} allowedRoles={['user']} />} />
          <Route path="pending-transactions" element={<ProtectedRoute element={<PendingTxsPage />} allowedRoles={['user']} />} />
          <Route path="pending-payment/:id" element={<h1>New page pipeline to be decided yet</h1>} />
        </Route>


        <Route path="seller" element={<ProtectedRoute element={<SellerHeaderLayout />} allowedRoles={['user']} />}>

          <Route index element={<Navigate to="dashboard" replace />} />
          {/* add routes for add product form , inbox, and /seller/dashboard with root elemetn as SellerLayout*/}
          <Route path="add-new-product" element={<ProtectedRoute element={<AddProductForm />} allowedRoles={['user']} />} />
          <Route path="chat" element={<ProtectedRoute element={<ChatPage />} allowedRoles={['user']} />} />
          <Route path="subscription" element={<ProtectedRoute element={<SubscriptionPage />} allowedRoles={['user']} />} />
          {/* <Route path="dashboard" element={<ProtectedRoute element={<SellerDashboardLayout />} allowedRoles={['user']} />} /> */}
          {/* Seller Routes - only sellers/users */}
          <Route path="dashboard" element={<ProtectedRoute element={<SellerDashboardLayout />} allowedRoles={['user']} />}>
            <Route index element={<SellerAnalytics />} />
            <Route element={<Navigate to="for-sale" replace />} />
            <Route path="for-sale" element={<SellerItems filterType="sale" />} />
            <Route path="for-rent" element={<SellerItems filterType="rent" />} />
            <Route path="sold" element={<SellerItems filterType="sold" />} />
            <Route path="rented-out" element={<SellerItems filterType="rented" />} />
            <Route path="requests" element={<SellerRequests />} />
            <Route path="accepted-pending" element={<AcceptedProducts />} />
          </Route>

          <Route path="subscription/vip"
            element={
              <PaymentPage
                type={subsData[0].type}
                duration={subsData[0].duration}
                Price={subsData[0].price}
                subscription={subsData[0].subscription}
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
                subscription={subsData[1].subscription}
                validTill={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toDateString()}
              />
            }
          />
        </Route>
        {/* Admin and Manager Routes - role specific */}
        <Route path="/admin" element={<ProtectedRoute element={<Admin />} allowedRoles={['admin']} />} />
        <Route path="/manager" element={<ProtectedRoute element={<ManagerDashboard />} allowedRoles={['manager']} />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;