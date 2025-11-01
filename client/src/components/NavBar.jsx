import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice"; 
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuth, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
      <h2>My App</h2>
        
      {isAuth ? (
        <div>
          <span style={{ marginRight: "1rem" }}>
            👋 Welcome, <b>{user?.username || "User"}</b>
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
