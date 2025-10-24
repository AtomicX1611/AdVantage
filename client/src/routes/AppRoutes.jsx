import {Route, BrowserRouter as Router,Routes} from "react-router-dom";
import Home from "../pages/Home";
import ProductDetail from '../pages/ProductDetail';
import Register from "../pages/Register";
import Admin from "../pages/Admin";
import Manager from "../pages/Manager";
import Login from "../pages/Login";

const AppRoutes = () => {  
  return (
    <Router>
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/product/:pid' element={<ProductDetail/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/admin' element={<Admin/>}/>
            <Route path='/manager' element={<Manager/>}/>            
        </Routes>
    </Router>
  )
}

export default AppRoutes
