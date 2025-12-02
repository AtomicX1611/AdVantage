export const API_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  API_ENDPOINTS: {
    FEATURED_PRODUCTS: '/anyone/HomeRequirements',
    FRESH_PRODUCTS: '/anyone/HomeRequirements',
    PRODUCT_DETAIL: '/api/products',
    CATEGORY_PRODUCTS: '/search/product/category',
    ADMIN_USERS: 'admin',
    ADMIN_GRAPH_DATA: 'admin/graphData',
    WISHLIST_GET: '/user/wishlist',
    WISHLIST_ADD: '/user/wishlist/add',
    WISHLIST_REMOVE: '/user/wishlist/remove',
  }
};

export default API_CONFIG;