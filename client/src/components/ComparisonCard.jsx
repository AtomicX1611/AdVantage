import React, { useState } from "react";
import styles from "../styles/wishlist.module.css";

export default function ComparisonCard({ product, removeFromCompare,deleteFromWishlist }) {
  const [imgIndex, setImgIndex] = useState(0);
  console.log(product.images);

  const nextImg = () =>
    setImgIndex((i) => (i + 1) % product.images.length);
  const prevImg = () =>
    setImgIndex((i) => (i - 1 + product.images.length) % product.images.length);

  return (
    <div className={styles["comparison-card"]}>
      <div className={styles.carousel}>
        <button onClick={prevImg}>❮</button>
        <img
          src={import.meta.env.VITE_BACKEND_URL+ "/" + product.images[imgIndex]}
          alt={product.name}
          className="clickable-img"
          height={100}
        />
        <button onClick={nextImg}>❯</button>
      </div>
      <h3>{product.name}</h3>
      <p><span className={styles["label-bold"]}>Price:</span> {product.price}</p>
      <p><span className={styles["label-bold"]}>Description:</span> {product.description}</p>
      <p><span className={styles["label-bold"]}>Seller:</span> {product.seller}</p>
      <h4><b>State:</b> {product.state}</h4>
      <h5><b>District:</b> {product.district}</h5>
      <h5><b>City:</b> {product.city}</h5>
      <p><b>Posting Date:</b> {product.postingDate}</p>
      <p><b>Zip Code:</b> {product.zipCode}</p>
      <button
        className={styles["remove-btn"]}
        onClick={() => removeFromCompare(product._id)}
      >
        X
      </button>
      <span style={{ display: "block", marginTop: "10px" }} onClick={deleteFromWishlist ? () => deleteFromWishlist(product._id) : null} className={styles["delete-wishlist"]}>
        Delete from Wishlist
      </span>
    </div>
  );
}
