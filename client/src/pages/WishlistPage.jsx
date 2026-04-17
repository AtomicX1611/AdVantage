import React, { useEffect, useState } from "react";
import WishlistSidebar from "../components/WishlistSidebar";
import ComparisonSection from "../components/ComparisionSection";
import styles from "../styles/wishlist.module.css";
import { useSelector } from "react-redux";

export default function WishlistPage() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  useEffect(() => {
  const fetchWishlist = async () => {
    if (!user) return;
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/user/wishlist`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    // console.log(res);
    const data = await res.json();
    if (!data.success) {
      console.log("Failed to fetch wishlist products");
      return;
    }
    setProducts(data.products);
  };

  fetchWishlist();
}, [user]);


  const backendURL = import.meta.env.VITE_BACKEND_URL;


  const removeFromWishlistBackend = async (productId) => {
    try {
      const res = await fetch(
        `${backendURL}/user/wishlist/remove/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      console.log("Removed from wishlist backend");
      return true;
    } catch (err) {
      console.error("Wishlist remove error:", err);
      return false;
    }
  };

  const deleteFromWishlist = async (productId) => {
  try {
    const response = await removeFromWishlistBackend(productId);
    if (!response) {
      console.error("Failed to delete from wishlist");
      return;
    }
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    
    setSelectedProducts((prev) =>
      prev.filter((p) => p._id !== productId)
    );
  } catch (err) {
    console.error("Wishlist delete failed:", err);
  }
};


  const addToCompare = (product) => {
    if (selectedProducts.find((p) => p._id === product._id)) return;

    if (selectedProducts.length >= 3) {
      alert("You can only compare up to 3 products.");
      return;
    }

    setSelectedProducts([...selectedProducts, product]);
    // addToWishlistBackend(product._id);
  };

  const removeFromCompare = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== id));
    // removeFromWishlistBackend(id);
  };

  return (
    <div className={styles.container}>
      <WishlistSidebar products={products} addToCompare={addToCompare}/>

      <ComparisonSection
        products={selectedProducts}
        removeFromCompare={removeFromCompare}
        deleteFromWishlist={deleteFromWishlist}
      />
    </div>
  );
}
