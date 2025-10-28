import React from 'react'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate()

  const goToLogin = () => {
    navigate('/login')
  }

  const goToRegister = () => {
    navigate('/register')
  }

  const goToProductDetail = () => {
    //pass product id here
    navigate('/product')
  } 
  
  return (
    <div>
      This is Home Page
      <div>
        <button onClick={goToLogin}>Login</button>
        <button onClick={goToRegister}>Register</button>
        <button onClick={goToProductDetail}>Product</button>
      </div>
    </div>
  )
}

export default Home;