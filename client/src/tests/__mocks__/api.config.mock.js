/**
 * ==========================================
 * API Config Mock
 * ==========================================
 * Mocked API configuration for Jest tests
 * Provides test environment URLs and endpoints
 */

export const API_CONFIG = {
  BACKEND_URL: "http://localhost:3000",
  API_ENDPOINTS: {
    FEATURED_PRODUCTS: "/anyone/HomeRequirements",
    FRESH_PRODUCTS: "/anyone/HomeRequirements",
    PRODUCT_DETAIL: "/api/products",
    CATEGORY_PRODUCTS: "/search/product/category",
    ADMIN_USERS: "admin",
    ADMIN_GRAPH_DATA: "admin/graphData",
    ADMIN_METRICS: "admin/metrics",
    ADMIN_PAYMENT_ANALYTICS: "admin/paymentAnalytics",
    ADMIN_ADD_MANAGER: "admin/addManager",
    WISHLIST_GET: "/user/wishlist",
    WISHLIST_ADD: "/user/wishlist/add",
    WISHLIST_REMOVE: "/user/wishlist/remove",
    CART_GET: "/user/cart",
    CART_ADD: "/user/cart/add",
    CART_REMOVE: "/user/cart/remove",
    ORDER_CREATE: "/user/orders",
    ORDER_GET: "/user/orders",
    PROFILE_GET: "/user/profile",
    PROFILE_UPDATE: "/user/profile",
    AUTH_LOGIN: "/auth/login",
    AUTH_SIGNUP: "/auth/signup",
    AUTH_ME: "/auth/me",
  },
};

export default API_CONFIG;
