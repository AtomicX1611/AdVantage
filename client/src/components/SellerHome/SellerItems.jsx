import React, { useEffect, useState } from 'react';
import styles from '../../styles/sellerdashboard.module.css';
import { Link } from 'react-router-dom';

// Dummy Data with Placeholder Images
const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: 'Physics Textbook (11th Ed)',
    price: '$20',
    type: 'sale',
    status: 'Active',
    image: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Physics+Book'
  },
  {
    id: 2,
    name: 'TI-84 Engineering Calculator',
    price: '$5/mo',
    type: 'rent',
    status: 'Active',
    image: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Calculator'
  },
  {
    id: 3,
    name: 'Gaming Laptop i7 GTX',
    price: '$500',
    type: 'sold',
    status: 'Completed',
    image: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Laptop'
  },
  {
    id: 4,
    name: 'Canon DSLR Camera Kit',
    price: '$15/day',
    type: 'rented',
    status: 'With User',
    image: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Camera'
  },
  {
    id: 5,
    name: 'Chemistry Lab Coat (M)',
    price: '$10',
    type: 'sale',
    status: 'Active',
    image: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Lab+Coat'
  },
];

function productFilter(filterType, products) {
  if (filterType === "sale") return products.filter(item => item.isRental === false && item.soldTo === null);
  if (filterType === "rent") return products.filter(item => item.isRental === true && item.soldTo === null);
  if (filterType === "sold") return products.filter(item => item.isRental === false && item.soldTo !== null);
  if (filterType === "rented") return products.filter(item => item.isRental === true && item.soldTo !== null);
}

const SellerItems = ({ filterType }) => {
  const [products, setProducts] = useState([]);
  const items = productFilter(filterType, products);
  // const items=DUMMY_PRODUCTS.filter(item=>item.type===filterType);
  const titles = {
    sale: 'Items For Sale',
    rent: 'Items For Rent',
    sold: 'Sold History',
    rented: 'Currently Rented Out'
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:3000/user/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        console.log(data.products);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, [filterType]);

  return (
    <div>
      <h2>{titles[filterType]}</h2>
      <div className={styles.grid}>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item._id} className={styles.card}>
              <div className={styles.cardImageContainer}>
                <img src={item.images[0]} alt={item.name} className={styles.cardImage} />
              </div>

              <div className={styles.cardDetails}>
                <div>
                  <h3>{item.name}</h3>
                  <p style={{ fontWeight: 'bold', color: '#334155' }}>Price: {item.price}</p>
                  {item.status && <span className={styles.status}>{item.status}</span>}
                </div>
                <div style={{ marginTop: '20px' }}>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: "none" }}>
                    <button
                      className={`${styles.btn} ${styles.btnAdd}`}
                      style={{ width: "100%" }}
                    >
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b' }}>No items found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default SellerItems;