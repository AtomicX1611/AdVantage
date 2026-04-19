let BACKEND_URL_VALUE = 'http://localhost:3000';

// Try to get from environment variables first (Jest will use process.env)
const processEnv = globalThis.process?.env;

if (processEnv?.VITE_BACKEND_URL) {
  BACKEND_URL_VALUE = processEnv.VITE_BACKEND_URL;
} else if (processEnv?.REACT_APP_BACKEND_URL) {
  BACKEND_URL_VALUE = processEnv.REACT_APP_BACKEND_URL;
}

// For Vite builds at runtime, this will be replaced by import.meta.env
// but we avoid using it directly here to prevent Babel parsing errors
// This block is for Vite, where import.meta will be available at module execution
BACKEND_URL_VALUE = globalThis.__VITE_BACKEND_URL__ || BACKEND_URL_VALUE;

export const API_CONFIG = {
  BACKEND_URL: BACKEND_URL_VALUE,
  API_ENDPOINTS: {
    FEATURED_PRODUCTS: '/anyone/HomeRequirements',
    FRESH_PRODUCTS: '/anyone/HomeRequirements',
    PRODUCT_DETAIL: '/api/products',
    CATEGORY_PRODUCTS: '/search/product/category',
    ADMIN_USERS: 'admin',
    ADMIN_GRAPH_DATA: 'admin/graphData',
    ADMIN_METRICS: 'admin/metrics',
    ADMIN_PAYMENT_ANALYTICS: 'admin/paymentAnalytics',
    ADMIN_ADD_MANAGER: 'admin/addManager',
    WISHLIST_GET: '/user/wishlist',
    WISHLIST_ADD: '/user/wishlist/add',
    WISHLIST_REMOVE: '/user/wishlist/remove',
    // Notifications
    NOTIFICATIONS_FETCH: '/user/getNotifications',
    NOTIFICATIONS_MARK_READ: '/user/notifications', // will PATCH /user/notifications/:id/read
    NOTIFICATIONS_MARK_ALL_READ: '/user/notifications/mark-all-read',
  }
};

export default API_CONFIG;