import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";
import "./__mocks__/server.mock.js";

jest.mock("../utils/imageUrl", () => ({
  resolveImageUrl: (imagePath, fallback = "/Assets/placeholder.png") => {
    if (imagePath === null || imagePath === undefined) {
      return fallback;
    }

    let normalized = String(imagePath).trim();
    if (!normalized) {
      return fallback;
    }

    normalized = normalized.replace(/\\/g, "/");

    if (/^(data:|blob:)/i.test(normalized)) {
      return normalized;
    }

    normalized = normalized.replace(/^https?:\/\/localhost:3000\/?/i, "/");

    if (/^https?:\/\//i.test(normalized)) {
      return normalized;
    }

    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  },
}));

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

window.scrollTo = jest.fn();

if (!window.location.reload) {
  window.location.reload = jest.fn();
}

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific warnings that don't affect tests
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: useLayoutEffect") ||
        args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Not implemented: HTMLFormElement.prototype.submit"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Suppress specific warnings
    if (
      typeof args[0] === "string" &&
      args[0].includes("componentWillReceiveProps")
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

if (!process.env.VITE_BACKEND_URL) {
  process.env.VITE_BACKEND_URL = "http://localhost:3000";
}

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
