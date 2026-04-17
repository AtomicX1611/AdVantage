import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCardHome from '../components/ProductCardHome';
import CategoryCard from '../components/CategoryCard';
import API_CONFIG from '../config/api.config';
import styles from '../styles/home.module.css';

const categories = [
  { name: 'Clothes', image: '/Assets/categories/image (1).png', id: 'clothes', path: 'Clothes' },
  { name: 'Mobiles', image: '/Assets/categories/image (3).png', id: 'mobile', path: 'Mobiles' },
  { name: 'Laptops', image: '/Assets/categories/image (4).png', id: 'laptops', path: 'Laptops' },
  { name: 'Electronics', image: '/Assets/categories/image (5).png', id: 'electronics', path: 'Electronics' },
  { name: 'Books', image: '/Assets/categories/image (6).png', id: 'books', path: 'Books' },
  { name: 'Furniture', image: '/Assets/categories/image (7).png', id: 'furniture', path: 'Furniture' },
  { name: 'Vehicles', image: '/Assets/categories/image (8).png', id: 'vehicles', path: 'Automobiles' },
  { name: 'Sports', image: '/Assets/categories/image (9).png', id: 'sports', path: 'Sports' },
  { name: 'Accessories', image: '/Assets/categories/image (10).png', id: 'accessories', path: 'Fashion' },
  { name: 'Music', image: '/Assets/categories/image (11).png', id: 'music', path: 'Musical Instruments' }
];

const Typewriter = ({ words, typingSpeed = 120, deletingSpeed = 60, pause = 1000 }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const tick = () => {
      const current = words[wordIndex];
      if (!isDeleting) {
        if (display.length < current.length) {
          timeoutId = setTimeout(() => {
            if (!mounted) return;
            setDisplay(current.slice(0, display.length + 1));
          }, typingSpeed);
        } else {
          timeoutId = setTimeout(() => {
            if (!mounted) return;
            setIsDeleting(true);
          }, pause);
        }
      } else {
        if (display.length > 0) {
          timeoutId = setTimeout(() => {
            if (!mounted) return;
            setDisplay(current.slice(0, display.length - 1));
          }, deletingSpeed);
        } else {
          timeoutId = setTimeout(() => {
            if (!mounted) return;
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }, 200);
        }
      }
    };

    tick();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [display, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pause]);

  return (
    <div className={styles.typewriter} aria-live="polite">
      {display.split('').map((ch, i) => (
        <span key={i} className={styles.typeLetter}>{ch}</span>
      ))}
      <span className={styles.cursor}>|</span>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [freshProducts, setFreshProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = API_CONFIG.BACKEND_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${backendURL}${API_CONFIG.API_ENDPOINTS.FEATURED_PRODUCTS}`)
        
        if (response.ok) {
          const data = await response.json();
          console.log("Full response data:", data);
          console.log("Featured products:", data.featuredProducts);
          console.log("Fresh products:", data.freshProducts);
          
          setFeaturedProducts(data.featuredProducts || []);
          setFreshProducts(data.freshProducts || []);
        } else {
          console.error("Response not OK:", response.status);
          setFeaturedProducts([]);
          setFreshProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setFeaturedProducts([]);
        setFreshProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [backendURL]);

  const handleCategoryClick = (categoryPath) => {
    navigate(`/search?category=${categoryPath}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.headerPoster}>
        <div className={styles.poster}>
          {/* Dial Code Feature */}
          <div className={styles.imgWrapper}>
            <img 
              src="/Assets/BannerImg.png" 
              alt="Logo" 
              className={styles.logo} 
              draggable="false" 
            />
          </div>
          <div className={styles.dialContainer}>
            <h1>A one stop place to</h1>
            <div className={styles.dial}>
              <Typewriter words={["BUY", "SELL", "RENT"]} />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      <section>
        <div className={styles.featuredCategories}>
          <div className={styles.featuredHeader}>
            <h2>Featured Categories</h2>
          </div>
          <div className={`${styles.featuredIcons} ${styles.iconsBox}`}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category.path)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className={styles.featuredProducts}>
          <div className={styles.featuredHeader}>
            <h2>Featured Products</h2>
          </div>
          <div className={styles.productList}>
            {loading ? (
              <p>Loading products...</p>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCardHome
                  key={product._id}
                  product={product}
                  backendURL={backendURL}
                  onClick={() => handleProductClick(product._id)}
                />
              ))
            ) : (
              <p>No featured products available</p>
            )}
          </div>
        </div>
      </section>

      {/* Fresh Recommendations Section */}
      <section>
        <div className={styles.fresh}>
          <div className={styles.featuredHeader}>
            <h2>Fresh Recommendations</h2>
          </div>
          <div className={styles.productList}>
            {loading ? (
              <p>Loading products...</p>
            ) : freshProducts.length > 0 ? (
              freshProducts.map((product) => (
                <ProductCardHome
                  key={product._id}
                  product={product}
                  backendURL={backendURL}
                  onClick={() => handleProductClick(product._id)}
                />
              ))
            ) : (
              <p>No fresh products available</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;