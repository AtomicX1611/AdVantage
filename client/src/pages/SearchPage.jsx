import React, { useState, useEffect } from "react";
import styles from "../styles/searchpage.module.css";
import FilterPanel from "../components/SearchPage/FilterPanel";
import ProductGrid from "../components/SearchPage/ProductGrid";
import { useSearchParams } from "react-router-dom";
import API_CONFIG from '../config/api.config';

const SearchPage = () => {
  const backendURL = API_CONFIG.BACKEND_URL;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    min: "",
    max: "",
    verifiedOnly: false,
    rentalOnly: false,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching data initiated");
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (searchQuery) queryParams.append('name', searchQuery);
        if (categoryParam) queryParams.append('category', categoryParam);
        if (filters.min) queryParams.append('minPrice', filters.min);
        if (filters.max) queryParams.append('maxPrice', filters.max);
        if (filters.verifiedOnly) queryParams.append('verified', 'true');
        if( filters.rentalOnly) queryParams.append('isRental', 'true');
        
        const url = `${backendURL}/anyone/products/filtered?${queryParams.toString()}`;
        console.log('Fetching from:', url);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend response:', data);
          console.log('Products received:', data.products);
          setProducts(data.products || []);
        } else {
          console.error('Response not OK:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryParam, filters, backendURL]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredProducts = filters.rentalOnly
    ? products.filter((p) => p.isRental)
    : products;


  return (
    <div className={styles.searchpage_window}>
      <main className={styles.mainContent}>
        <div id={styles.up}>
          <b id={styles.filters}>
            FILTERS 
            {searchQuery && ` - Results for "${searchQuery}"`}
            {categoryParam && ` - Category: ${categoryParam}`}
          </b>
        </div>

        <div id={styles.bottom}>
          <FilterPanel filters={filters} onChange={handleFilterChange} />
          {loading ? (
            <div>Loading products...</div>
          ) : (
            <ProductGrid backendURL={backendURL} products={filteredProducts} />
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
