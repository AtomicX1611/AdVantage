export const API_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  API_ENDPOINTS: {
    FEATURED_PRODUCTS: '/anyone/HomeRequirements',
    FRESH_PRODUCTS: '/anyone/HomeRequirements',
    PRODUCT_DETAIL: '/api/products',
    CATEGORY_PRODUCTS: '/search/product/category',
  }
};

export default API_CONFIG;
