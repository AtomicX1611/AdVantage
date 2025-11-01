import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageGallery from "../components/ImageGallery";
import ProductInfo from "../components/ProductInfo";
import ActionButtons from "../components/ActionButtons";
import SellerOptions from "../components/SellerOptions";
import RentForm from "../components/RentForm";
import Notification from "../components/NotificationCard";
import styles from "../styles/productdetails.module.css";

const ProductDetailPage = () => {
  
  const { pid } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRentForm, setShowRentForm] = useState(false);
  const [notification, setNotification] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/anyone/products/${pid}`
        );

        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load product");
          setLoading(false);
          return;
        }

        console.log("Product laoded: ", data.product);
        setProduct(data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Something went wrong while fetching product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [pid]);

  const handleAddToWishlist = () => {
    setNotification("Added to Wishlist!");
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 1000);
  };

  const handleRentNow = () => {
    setShowRentForm(true);
  };

  const handleSubmitRent = (fromDate, toDate) => {
    alert(`Rent request submitted: ${fromDate} → ${toDate}`);
    setShowRentForm(false);
  };

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "120px" }}>Loading...</h2>;
  }

  if (error) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "120px", color: "red" }}>
        {error}
      </h2>
    );
  }

  if (!product) {
    return <h2 style={{ textAlign: "center", marginTop: "120px" }}>Product not found</h2>;
  }

  
  const productImages = product.images || [
    product.Image1Src,
    product.Image2Src,
    product.Image3Src
  ].filter(Boolean);

  return (
    <div className={styles["BG"]}>
      {showNotif && (
        <Notification
          message={notification}
          onClose={() => setShowNotif(false)}
        />
      )}

      <div className={styles["main_container"]}>
        <div className={styles["product_display"]}>
          <ImageGallery images={productImages} />

          <div className={styles["product_details"]}>
            <ProductInfo product={product} />

            <ActionButtons
              isRental={product.isRental}
              soldTo={product.soldTo}
              onAddToWishlist={handleAddToWishlist}
              onRentNow={handleRentNow}
            />

            <SellerOptions verified={product.verified} />
          </div>
        </div>

        <div className={styles.description}>
          <h2 className={styles.item_desc}>Description</h2>
          <h3 className={styles.item_title}>{product.description}</h3>
        </div>

        {showRentForm && (
          <RentForm
            onClose={() => setShowRentForm(false)}
            onSubmit={handleSubmitRent}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
