module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testTimeout: 180000,
  moduleFileExtensions: ["js", "json"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov", "json-summary"],
  testPathIgnorePatterns: ["/node_modules/"],
};
