/**
 * ==========================================
 * Mock Server Setup
 * ==========================================
 * Provides mock fetch for API calls in tests
 * Uses Jest's native fetch mocking
 */

const mockHandlers = {
  "GET/auth/me": {
    success: true,
    user: {
      id: "test-user-1",
      email: "test@example.com",
      username: "testuser",
      role: "user",
      profilePicPath: "/Assets/user-avatar.png",
    },
  },
  "POST/auth/login": {
    success: true,
    message: "Login successful",
    user: {
      id: "test-user-1",
      email: "test@example.com",
      username: "testuser",
      role: "user",
    },
  },
  "POST/auth/signup": {
    success: true,
    message: "Signup successful",
    user: {
      id: "new-user-1",
      email: "test@example.com",
      username: "newuser",
      role: "user",
    },
  },
  "GET/products/featured": {
    success: true,
    featuredProducts: [
      {
        _id: "prod-1",
        name: "Product 1",
        price: 100,
        image: "/Assets/prod1.png",
        category: "Electronics",
      },
      {
        _id: "prod-2",
        name: "Product 2",
        price: 200,
        image: "/Assets/prod2.png",
        category: "Clothes",
      },
    ],
    freshProducts: [
      {
        _id: "prod-3",
        name: "Fresh Product 1",
        price: 150,
        image: "/Assets/prod3.png",
        category: "Books",
      },
    ],
  },
  "GET/user/wishlist": {
    success: true,
    wishlist: [{ _id: "prod-1", name: "Product 1", price: 100 }],
  },
  "GET/user/orders": {
    success: true,
    orders: [
      {
        _id: "order-1",
        productId: "prod-1",
        status: "completed",
        total: 100,
      },
    ],
  },
};

/**
 * Mock fetch function
 */
global.fetch = jest.fn((url, options = {}) => {
  const urlObj = new URL(url, "http://localhost:3000");
  const method = options.method || "GET";
  const key = `${method}${urlObj.pathname}`;

  // Check if handler exists
  const handler = mockHandlers[key];

  if (handler) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(handler),
      text: () => Promise.resolve(JSON.stringify(handler)),
    });
  }

  // Default 404 response
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: "Not found" }),
  });
});

/**
 * Server object for test setup/teardown
 */
export const server = {
  listen: jest.fn(),
  resetHandlers: jest.fn(() => {
    // Reset handlers to defaults
  }),
  close: jest.fn(),
  use: jest.fn((handlers) => {
    // Can be extended to override default handlers
  }),
};

/**
 * Handlers export for consistency with MSW API
 */
export const handlers = [];

