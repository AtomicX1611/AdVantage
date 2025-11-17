import {Navigate, Route, BrowserRouter as Router,Routes} from "react-router-dom";
import Home from "../pages/Home";
import ProductDetail from '../pages/ProductDetail';
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Manager from "../pages/Manager";
import SubscriptionPage from "../pages/Subscription.page";
import PaymentPage from "../pages/Payment.page";
import Login from "../pages/Login";
import { useSelector } from "react-redux";
import YourOrders from "../pages/YourOrders.page";
import ChatPage from "../pages/ChatPage";
import WishList from '../pages/WishlistPage.jsx'
import Profile from '../pages/Profile.jsx'
import ProductDetailPage from '../pages/ProductDetailPage.jsx'
import HomeHeader from "../components/Header.jsx";
import AddProductForm from "../pages/AddProductForm.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import ViewRequest from "../pages/ViewRequest.jsx"


const ProtectedRoute = ({ element }) => {
  const { isAuth } = useSelector((state) => state.auth);
  return isAuth ? element : <Navigate to="/login" replace />;
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
]


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomeHeader />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/wishlist" element={<WishList />} />
        <Route path="/search" element={<SearchPage />} />
        {/* Basic route to navigte , use search query and params as required*/}
        <Route path="/my-orders" element={<YourOrders />} />

        <Route path="/add-new-product" element={<AddProductForm />} />

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

        <Route path="/product-requests" element={<ViewRequest />}/>
        <Route path="/pending-payment/:id" element={<h1>New page pipeline to be decided yet</h1>}/>
        <Route path='/product/:pid' element={<ProductDetailPage/>} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/manager' element={<Manager />} />
      </Routes>
    </Router>
  )
}

export default AppRoutes
