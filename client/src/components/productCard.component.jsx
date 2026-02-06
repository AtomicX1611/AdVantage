import { useState } from 'react';
import classes from '../styles/Home.module.css';

const ProductCard = ({ productDetails }) => {
    const { name, images, price } = productDetails;
    return (
        <>
            <div className={classes.product_card}>
                <img src={import.meta.env.VITE_BACKEND_URL + images[0]} alt="Product Image" style={{ width: '100%', height: '35vh' }} />
                <h4 style={{
                    marginLeft: '20px',
                    fontSize: '15px',
                    color: 'black',
                    fontWeight: 400,
                    textAlign: 'center',
                    marginTop: '20px',
                }}>
                    {name}
                </h4>
                <h3 style={{
                    fontSize: '20px',
                    marginLeft: '0px',
                    color: 'black',
                    textAlign: 'right',
                    marginRight: '5px',
                    fontWeight: 600,
                }}>Rs. {price}/-</h3>
            </div>
        </>
    );
}

export default ProductCard;