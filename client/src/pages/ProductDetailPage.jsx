import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageGallery from "../components/ImageGallery";
import ProductInfo from "../components/ProductInfo";
import ActionButtons from "../components/ActionButtons";
import SellerOptions from "../components/SellerOptions";
import RentForm from "../components/RentForm";
import BidModal from "../components/BidModal";
import Notification from "../components/NotificationCard";
import styles from "../styles/productdetails.module.css";

const ProductDetailPage = () => {
  
  const { pid } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRentForm, setShowRentForm] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
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

  const handleAddToWishlist = async () => {
    try {
      const url = `http://localhost:3000/user/wishlist/add/${pid}`;
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if(data.success) {
        alert("Added to Wishlist!");
      } else {
        alert(data.message || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Error adding to wishlist");
    }
  };

  const handleRentNow = () => {
    console.log("clicked..");
    setShowRentForm(true);
  };

  const handleBuyNow = () => {
    console.log("clicked..")
    setShowBidModal(true);
  };

  const handleSubmitBid = async (bidAmount) => {
    try {
      // keep bid amount > product.price for safety
       const response = await fetch(`http://localhost:3000/user/request/${pid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          biddingPrice: parseInt(bidAmount),
        }),
      });

      const data = await response.json();
      console.log("data: ",data);
      if (response.ok) {
        alert(`Bid of ₹${bidAmount} submitted successfully!`);
        setShowBidModal(false);
      } else {
        alert(data.message || "Failed to submit bid");
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert("An error occurred while submitting your bid");
    }
  };

  const handleSubmitRent = async (fromDate, toDate, pricePerDay) => {
    try {
      // Calculate number of days
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalPrice = diffDays * pricePerDay;

      // TODO: Replace with actual API call
      const response = await fetch(`http://localhost:3000/user/rent/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          from:fromDate,
          to:toDate,
          biddingPrice:pricePerDay,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to submit rent request");
        return;
      }
      alert(`Rent request submitted:\nFrom: ${fromDate}\nTo: ${toDate}\nPrice per day: ₹${pricePerDay}\nTotal: ₹${totalPrice} (${diffDays} days)`);
      setShowRentForm(false);
    } catch (error) {
      console.error("Error submitting rent request:", error);
      alert("An error occurred while submitting your rent request");
    }
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
              sellerId={product.seller}
              onAddToWishlist={handleAddToWishlist}
              onRentNow={handleRentNow}
              onBuyNow={handleBuyNow}
            />

            {/* <SellerOptions verified={product.verified} /> */}
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
            productPrice={product.price}
          />
        )}

        {showBidModal && (
          <BidModal
            onClose={() => setShowBidModal(false)}
            onSubmit={handleSubmitBid}
            productPrice={product.price}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
