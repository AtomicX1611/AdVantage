/**
 * ==========================================
 * Auth Check Utility Tests
 * ==========================================
 * Tests for authentication checking utilities
 */

import { checkAuth, authFetch } from "../../utils/authCheck";

describe("checkAuth", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch.mockClear();
  });

  describe("Successful Authentication", () => {
    test("should return true for authenticated user", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      const mockNavigate = jest.fn();
      const result = await checkAuth("/user/profile", mockNavigate);

      expect(result).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("should return true without navigate parameter", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await checkAuth("/user/profile");
      expect(result).toBe(true);
    });
  });

  describe("Authentication Failures", () => {
    test("should return false and navigate on 403 status", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const mockNavigate = jest.fn();
      const result = await checkAuth("/user/profile", mockNavigate);

      expect(result).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("should return false without redirecting if navigate is not provided", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const result = await checkAuth("/user/profile");
      expect(result).toBe(false);
    });

    test("should return false for non-ok responses", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const mockNavigate = jest.fn();
      const result = await checkAuth("/user/protected", mockNavigate);

      expect(result).toBe(false);
    });
  });

  describe("Error Handling", () => {
    test("should handle network errors gracefully", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const mockNavigate = jest.fn();
      const result = await checkAuth("/user/error", mockNavigate);

      expect(result).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("should log error message on network failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      await checkAuth("/user/error");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Auth check failed:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Different Endpoints", () => {
    test("should check different protected endpoints", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

      const endpoints = [
        "/user/profile",
        "/user/wishlist",
        "/user/orders",
      ];

      for (const endpoint of endpoints) {
        const result = await checkAuth(endpoint);
        expect(result).toBe(true);
      }
    });
  });
});

describe("authFetch", () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  describe("Fetch Configuration", () => {
    test("should include credentials by default", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await authFetch("http://localhost:3000/api/test", {});

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });

    test("should set Content-Type header", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await authFetch("http://localhost:3000/api/test", {});

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    test("should merge custom headers with default headers", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await authFetch("http://localhost:3000/api/test", {
        headers: {
          "X-Custom-Header": "value",
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Custom-Header": "value",
          }),
        })
      );
    });
  });

  describe("Request Methods", () => {
    test("should handle GET requests", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await authFetch("http://localhost:3000/api/test", { method: "GET" });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    test("should handle POST requests with body", async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const data = { email: "test@example.com" };
      await authFetch("http://localhost:3000/api/test", {
        method: "POST",
        body: JSON.stringify(data),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe("Error Handling", () => {
    test("should handle 403 errors", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const mockNavigate = jest.fn();

      const response = await authFetch(
        "http://localhost:3000/protected",
        { method: "GET" },
        mockNavigate
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });
});

