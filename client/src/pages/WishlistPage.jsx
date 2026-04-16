import React, { useEffect, useState } from "react";
import WishlistSidebar from "../components/WishlistSidebar";
import ComparisonSection from "../components/ComparisionSection";
import styles from "../styles/wishlist.module.css";
import { useSelector } from "react-redux";

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
  const { isAuth, user } = useSelector((state) => state.auth);
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
