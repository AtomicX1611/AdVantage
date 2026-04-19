import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../redux/authSlice";

/**
 * ==========================================
 * Custom Render Function
 * ==========================================
 * Wraps component with Redux Provider and BrowserRouter
 * Allows custom store configuration for specific tests
 */

function createMockStore(initialState = {}) {
  const defaultState = {
    auth: {
      user: null,
      isAuth: false,
      error: null,
      loading: false,
    },
  };

  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      ...defaultState,
      ...initialState,
    },
  });
}

export function renderWithProviders(
  component,
  {
    initialState = {},
    store = createMockStore(initialState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return {
    ...rtlRender(component, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

export function renderWithStore(component, store) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return rtlRender(component, { wrapper: Wrapper });
}

export function renderWithRouter(component) {
  function Wrapper({ children }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return rtlRender(component, { wrapper: Wrapper });
}

/**
 * ==========================================
 * Mock Store Creator
 * ==========================================
 * Creates Redux store with predefined states for testing
 */

export const mockStores = {
  // Authenticated user store
  authenticated: {
    auth: {
      user: {
        id: "test-user-1",
        email: "test@example.com",
        username: "testuser",
        role: "user",
        profilePicPath: "/Assets/user-avatar.png",
      },
      isAuth: true,
      error: null,
      loading: false,
    },
  },

  // Unauthenticated user store
  unauthenticated: {
    auth: {
      user: null,
      isAuth: false,
      error: null,
      loading: false,
    },
  },

  // Loading store
  loading: {
    auth: {
      user: null,
      isAuth: false,
      error: null,
      loading: true,
    },
  },

  // Error store
  error: {
    auth: {
      user: null,
      isAuth: false,
      error: "Authentication failed",
      loading: false,
    },
  },

  // Admin user store
  admin: {
    auth: {
      user: {
        id: "admin-1",
        email: "admin@example.com",
        username: "admin",
        role: "admin",
        profilePicPath: "/Assets/admin-avatar.png",
      },
      isAuth: true,
      error: null,
      loading: false,
    },
  },

  // Manager user store
  manager: {
    auth: {
      user: {
        id: "manager-1",
        email: "manager@example.com",
        username: "manager",
        role: "manager",
        profilePicPath: "/Assets/manager-avatar.png",
      },
      isAuth: true,
      error: null,
      loading: false,
    },
  },
};

/**
 * ==========================================
 * Test Data Generators
 * ==========================================
 */

export const createMockUser = (overrides = {}) => ({
  id: "user-" + Math.random().toString(36).substr(2, 9),
  email: "user@example.com",
  username: "testuser",
  role: "user",
  profilePicPath: "/Assets/user-avatar.png",
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  _id: "prod-" + Math.random().toString(36).substr(2, 9),
  name: "Test Product",
  price: 100,
  description: "A great test product",
  category: "Electronics",
  image: "/Assets/product.png",
  seller: "seller-id",
  rating: 4.5,
  reviews: [],
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  _id: "order-" + Math.random().toString(36).substr(2, 9),
  productId: "prod-1",
  buyerId: "user-1",
  status: "completed",
  total: 100,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  _id: "conv-" + Math.random().toString(36).substr(2, 9),
  participantId: "user-2",
  participantName: "John Doe",
  lastMessage: "Hello!",
  lastMessageTime: new Date().toISOString(),
  ...overrides,
});

/**
 * ==========================================
 * Mock API Utilities
 * ==========================================
 */

export const mockFetch = (data = {}, options = {}) => {
  const { status = 200, ok = true } = options;
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

export const mockFetchError = (error = "Network error") => {
  return Promise.reject(new Error(error));
};

/**
 * ==========================================
 * Wait Utilities
 * ==========================================
 */

export const waitForElement = async (testFn, options = {}) => {
  const { timeout = 3000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const element = testFn();
      if (element) return element;
    } catch (error) {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Element not found within timeout");
};

/**
 * ==========================================
 * Re-export all testing library utilities
 * ==========================================
 */
export * from "@testing-library/react";
