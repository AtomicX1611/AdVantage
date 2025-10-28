import {Navigate, Route, BrowserRouter as Router,Routes} from "react-router-dom";
import Home from "../pages/Home";
import ProductDetail from '../pages/ProductDetail';
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Manager from "../pages/Manager";
import Login from "../pages/Login";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element }) => {
  const { isAuth } = useSelector((state) => state.auth);
  return isAuth ? element : <Navigate to="/login" replace />;
};


const AppRoutes = () => {  
  return (
          <Routes>
            <Route path="/" element={<ProtectedRoute element={<Home />} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/product/:pid' element={<ProductDetail/>}/>
            <Route path='/admin' element={<Admin/>}/>
            <Route path='/manager' element={<Manager/>}/>            
        </Routes>
  )
}

export default AppRoutes
