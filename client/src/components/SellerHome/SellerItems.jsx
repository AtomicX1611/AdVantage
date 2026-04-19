import React, { useEffect, useState } from 'react';
import styles from '../../styles/sellerdashboard.module.css';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api.config';
import ComplaintModal from '../ComplaintModal';
import { resolveImageUrl } from '../../utils/imageUrl';

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
    id: 3,
    name: 'Gaming Laptop i7 GTX',
    price: '$500',
    type: 'sold',
    status: 'Completed',
    image: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Laptop'
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
  if (filterType === "sale") return products.filter(item => item.soldTo === null);
  if (filterType === "sold") return products.filter(item => item.soldTo !== null);
}


const SellerItems = ({ filterType }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complaintProduct, setComplaintProduct] = useState(null);
  const items = productFilter(filterType, products);
  
  const titles = {
    sale: 'Items For Sale',
    sold: 'Sold History',
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
                    ? resolveImageUrl(item.images[0])
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
                  {item.soldTo !== null && (
                    <button
                      className={styles.btnDel}
                      style={{ backgroundColor: "#fff3f3", color: "#d32f2f", border: "1px solid #d32f2f" }}
                      onClick={() => setComplaintProduct(item)}
                    >
                      Report Buyer
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

      {complaintProduct && (
        <ComplaintModal
          onClose={() => setComplaintProduct(null)}
          productId={complaintProduct._id}
          productName={complaintProduct.name}
          source="seller_dashboard"
        />
      )}
    </div>
  );
};

export default SellerItems;