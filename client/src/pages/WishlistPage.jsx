import React, { useState } from "react";
import WishlistSidebar from "../components/WishlistSidebar";
import ComparisonSection from "../components/ComparisionSection";
import styles from "../styles/wishlist.module.css";

const dummyProducts = [
  {
    id: 1,
    name: "Redmi Note 12 Pro+ 5G",
    price: "₹29,999",
    images: ["/images/redmi1.jpg", "/images/redmi2.jpg", "/images/redmi3.jpg"],
    description: "200MP Camera, AMOLED Display, 120W Fast Charging",
    seller: "Xiaomi India",
    postingDate: "14 March 2025",
    zipCode: "560001",
    city: "Bangalore",
    district: "Bangalore Urban",
    state: "Karnataka",
  },
  {
    id: 2,
    name: "Dell XPS 15",
    price: "₹1,89,999",
    images: ["/images/dell1.jpg", "/images/dell2.jpg", "/images/dell3.jpg"],
    description: "Intel i7, 16GB RAM, OLED Display",
    seller: "Dell India",
    postingDate: "March 2023",
    zipCode: "500081",
    city: "Hyderabad",
    district: "Ranga Reddy",
    state: "Telangana",
  },
  {
    id: 3,
    name: "Apple Watch Series 9",
    price: "₹45,900",
    images: ["/images/watch1.jpg", "/images/watch2.jpg"],
    description: "S9 Chip, Always-On Display, GPS + Cellular",
    seller: "Apple India",
    postingDate: "Sept 2023",
    zipCode: "400070",
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
  },
];

export default function WishlistPage() {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const addToWishlistBackend = async (productId) => {
    try {
      const res = await fetch("http://localhost:3000/user/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        throw new Error("Failed to add to wishlist");
      }

      console.log("Added to wishlist backend");
    } catch (err) {
      console.error("Wishlist add error:", err);
    }
  };

  const removeFromWishlistBackend = async (productId) => {
    try {
      const res = await fetch(
        `http://localhost:3001/user/wishlist/remove/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      console.log("Removed from wishlist backend");
    } catch (err) {
      console.error("Wishlist remove error:", err);
    }
  };

  const addToCompare = (product) => {
    if (selectedProducts.find((p) => p.id === product.id)) return;

    if (selectedProducts.length >= 3) {
      alert("You can only compare up to 3 products.");
      return;
    }

    setSelectedProducts([...selectedProducts, product]);
    addToWishlistBackend(product.id);
  };

  const removeFromCompare = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    removeFromWishlistBackend(id);
  };

  return (
    <div className={styles.container}>
      <WishlistSidebar products={dummyProducts} addToCompare={addToCompare} />

      <ComparisonSection
        products={selectedProducts}
        removeFromCompare={removeFromCompare}
      />
    </div>
  );
}
