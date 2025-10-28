import { useState } from 'react'
import './App.css'
import AppRoutes from "./routes/AppRoutes"
import Navbar from './components/NavBar'

function App() {
  return (
   <>
     <Navbar/>
   <AppRoutes/>
   </>
  )
}

export default App
