import React from 'react'
import PaymentData from '../components/PaymentData.component.jsx'
import PaymentInputs from '../components/PaymentInput.component.jsx'

function PaymentPage({ type, duration, validTill, Price }) {
  return (
    <div style={{height:'100vh', width:'100vw',display:'flex',justifyContent:'center',alignItems:'center' , gap:'3vw'}}>
        <PaymentInputs type={type} price={Price} />
        <PaymentData type={type} duration={duration} validTill={validTill} Price={Price} />
    </div>
  )
}

export default PaymentPage
