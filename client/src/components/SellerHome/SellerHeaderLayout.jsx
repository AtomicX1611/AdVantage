import React from 'react'
import { Outlet } from 'react-router-dom'
import SellerHeader from './SellerHeader.jsx'

function SellerHeaderLayout() {
  return (
    <>
        <SellerHeader />
        <Outlet />
    </>
  )
}

export default SellerHeaderLayout
