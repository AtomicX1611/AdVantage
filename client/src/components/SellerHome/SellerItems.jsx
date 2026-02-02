import React, { useEffect, useState } from 'react';
import styles from '../../styles/sellerdashboard.module.css';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api.config';

const backendURL = API_CONFIG.BACKEND_URL;

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
  const [isLoading, setIsLoading] = useState(true);
  const items = productFilter(filterType, products);
  
  const titles = {
    sale: 'Items For Sale',
    rent: 'Items For Rent',
    sold: 'Sold History',
    rented: 'Currently Rented Out'
  };

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendURL}/user/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        console.log("data : ",data.products);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [filterType]);

  async function handleDeleteProduct(productId) {
    let response = await fetch(`${backendURL}/user/deleteProduct/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    let data = await response.json();
    console.log("data in delete:", data);
    if (data.success) {
      alert("Product deleted successfully");
      setProducts(prevProducts => prevProducts.filter(item => item._id !== productId));
    } else {
      alert("Error deleting product");
    }
  }

  async function handleMakeAvailable(productId) {
  try {
    let response = await fetch(`${backendURL}/user/makeAvailable/${productId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-type": "application/json"
      }
    });

    let data = await response.json();

    if (data.success) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? { ...product, soldTo: null } : product
        )
      );
      
      alert("Item is now back in the available listings!");
    } else {
      alert(data.message || "Cannot mark available");
    }
  } catch (error) {
    console.error("Error making product available:", error);
    alert("Network error. Please try again.");
  }
}

  return (
    <div>
      <h2>{titles[filterType]}</h2>
      
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your products...</p>
        </div>
      ) : items.length > 0 ? (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item._id} className={styles.card}>
              <div className={styles.cardImageContainer}>
                <img 
                  src={item.images && item.images.length > 0 
                    ? `${backendURL}/${item.images[0].replace(/\\/g, '/')}` 
                    : 'https://placehold.co/400x300?text=No+Image'} 
                  alt={item.name} 
                  className={styles.cardImage} 
                />
              </div>

              <div className={styles.cardDetails}>
                <h3>{item.name}</h3>
                <p className={styles.cardPrice}>₹{item.price}</p>
                {item.status && <span className={styles.status}>{item.status}</span>}

                <div className={styles.cardActions}>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: "none", flex: 1 }}>
                    <button className={styles.btnAvl} style={{ width: "100%" }}>
                      View Details
                    </button>
                  </Link>
                  {item.soldTo === null && (
                    <button
                      className={styles.btnDel}
                      onClick={() => handleDeleteProduct(item._id)}
                    >
                      Delete
                    </button>
                  )}
                  {(item.soldTo !== null && item.isRental) && (
                    <button
                      className={styles.btnAvl}
                      onClick={() => handleMakeAvailable(item._id)}
                    >
                      Make Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📦</span>
          <h3 className={styles.emptyTitle}>No items found</h3>
          <p className={styles.emptyText}>
            You don't have any items in this category yet. Add a new product to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default SellerItems;