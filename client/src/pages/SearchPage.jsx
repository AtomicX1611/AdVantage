import React, { useState } from "react";
import styles from "../styles/searchpage.module.css";
import FilterPanel from "../components/SearchPage/FilterPanel";
import ProductGrid from "../components/SearchPage/ProductGrid";

const SearchPage = () => {
  const backendURL = "https://dummybackend.com/";

  const [products] = useState([
    {
      _id: "1",
      name: "Dell Inspiron Laptop",
      price: 45000,
      verified: true,
      isRental: false,
      images: ["/images/laptop.jpg"],
    },
    {
      _id: "2",
      name: "iPhone 14",
      price: 85000,
      verified: false,
      isRental: true,
      images: ["/images/iphone.jpg"],
    },
    {
      _id: "3",
      name: "Canon DSLR Camera",
      price: 52000,
      verified: true,
      isRental: true,
      images: ["/images/camera.jpg"],
    },
  ]);

  const [filters, setFilters] = useState({
    min: "",
    max: "",
    verifiedOnly: false,
    rentalOnly: false,
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredProducts = products.filter((p) => {
    const price = parseFloat(p.price);
    const min = filters.min ? parseFloat(filters.min) : 0;
    const max = filters.max ? parseFloat(filters.max) : Infinity;

    return (
      price >= min &&
      price <= max &&
      (!filters.verifiedOnly || p.verified) &&
      (!filters.rentalOnly || p.isRental)
    );
  });

  return (
    <div className={styles.searchpage_window}>
      <main>
        <div id={styles.up}>
          <b id={styles.filters}>FILTERS</b>
        </div>

        <div id={styles.bottom}>
          <FilterPanel filters={filters} onChange={handleFilterChange} />
          <ProductGrid backendURL={backendURL} products={filteredProducts} />
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
