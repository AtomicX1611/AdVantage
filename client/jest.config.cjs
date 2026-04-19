module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "jsx", "json"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    // Match any path ending with /config/api.config or just api.config
    "^(.*/)?config/api\\.config(\\.[a-z]+)?$": "<rootDir>/src/tests/__mocks__/api.config.mock.js",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid|js-sdp|ms)/)",
  ],
  setupFiles: ["<rootDir>/src/tests/globalSetup.js"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.js"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/**/*.test.{js,jsx}",
    "!src/tests/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov", "json-summary"],
  testPathIgnorePatterns: ["/node_modules/"],
  testTimeout: 10000,
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx}",
  ],
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
