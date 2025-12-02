export const API_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  API_ENDPOINTS: {
    FEATURED_PRODUCTS: '/anyone/HomeRequirements',
    FRESH_PRODUCTS: '/anyone/HomeRequirements',
    PRODUCT_DETAIL: '/api/products',
    CATEGORY_PRODUCTS: '/search/product/category',
    // Notification endpoints
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_UNREAD: '/notifications/unread',
    NOTIFICATIONS_COUNT: '/notifications/count',
    NOTIFICATIONS_MARK_READ: '/notifications/:id/read',
    NOTIFICATIONS_MARK_ALL_READ: '/notifications/read/all',
    NOTIFICATIONS_DELETE: '/notifications/:id',
    NOTIFICATIONS_DELETE_READ: '/notifications/read/cleanup',
    NOTIFICATIONS_DELETE_ALL: '/notifications/all/clear',
  }
};

export default API_CONFIG;
