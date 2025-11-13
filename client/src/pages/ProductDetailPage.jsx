import React, { useState } from "react";
import ImageGallery from "../components/ImageGallery";
import ProductInfo from "../components/ProductInfo";
import ActionButtons from "../components/ActionButtons";
import SellerOptions from "../components/SellerOptions";
import RentForm from "../components/RentForm";
import Notification from "../components/NotificationCard";
import styles from "../styles/productdetails.module.css";

const ProductDetailPage = () => {
  const [showRentForm, setShowRentForm] = useState(false);
  const [notification, setNotification] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  // Dummy product data
  const product = {
    id: "123",
    name: "Canon DSLR Camera",
    price: 25000,
    isRental: true,
    verified: true,
    soldTo: null,
    description:
      "A professional DSLR camera with excellent low-light performance and lens compatibility.",
    images: [
      "/assets/products/cam1.jpg",
      "/assets/products/cam2.jpg",
      "/assets/products/cam3.jpg",
    ],
    address: {
      state: "Andhra Pradesh",
      district: "Chittoor",
      city: "Sri City",
    },
  };

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

  return (
    <div className={styles['BG']}>
      {showNotif && (
        <Notification message={notification} onClose={() => setShowNotif(false)} />
      )}
      <div className={styles['main_container']}>
        <div className={styles['product_display']}>
          <ImageGallery images={product.images} />
          <div className={styles['product_details']}>
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
