/**
 * ==========================================
 * Image URL Utility Tests
 * ==========================================
 * Tests for resolveImageUrl utility function
 */

import { resolveImageUrl } from "../../utils/imageUrl";

describe("resolveImageUrl", () => {
  describe("Valid Image Paths", () => {
    test("should return fallback for null/undefined input", () => {
      expect(resolveImageUrl(null)).toBe("/Assets/placeholder.png");
      expect(resolveImageUrl(undefined)).toBe("/Assets/placeholder.png");
    });

    test("should return empty string as fallback for empty input", () => {
      expect(resolveImageUrl("")).toBe("/Assets/placeholder.png");
    });

    test("should handle custom fallback images", () => {
      const customFallback = "/Assets/custom-placeholder.png";
      expect(resolveImageUrl(null, customFallback)).toBe(customFallback);
      expect(resolveImageUrl(undefined, customFallback)).toBe(customFallback);
    });

    test("should return relative paths starting with /", () => {
      expect(resolveImageUrl("/Assets/product.png")).toBe(
        "/Assets/product.png"
      );
      expect(resolveImageUrl("/images/photo.jpg")).toBe("/images/photo.jpg");
    });

    test("should add leading slash to relative paths", () => {
      expect(resolveImageUrl("Assets/product.png")).toBe(
        "/Assets/product.png"
      );
      expect(resolveImageUrl("images/photo.jpg")).toBe("/images/photo.jpg");
    });
  });

  describe("Absolute URLs", () => {
    test("should return http URLs unchanged", () => {
      const httpUrl = "http://example.com/image.png";
      expect(resolveImageUrl(httpUrl)).toBe(httpUrl);
    });

    test("should return https URLs unchanged", () => {
      const httpsUrl = "https://example.com/image.png";
      expect(resolveImageUrl(httpsUrl)).toBe(httpsUrl);
    });

    test("should return data URLs unchanged", () => {
      const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      expect(resolveImageUrl(dataUrl)).toBe(dataUrl);
    });

    test("should return blob URLs unchanged", () => {
      const blobUrl = "blob:http://localhost:3000/12345";
      expect(resolveImageUrl(blobUrl)).toBe(blobUrl);
    });
  });

  describe("Windows Path Normalization", () => {
    test("should convert backslashes to forward slashes", () => {
      expect(resolveImageUrl("Assets\\product.png")).toBe(
        "/Assets/product.png"
      );
      expect(resolveImageUrl("images\\subfolder\\photo.jpg")).toBe(
        "/images/subfolder/photo.jpg"
      );
    });

    test("should handle mixed slashes", () => {
      expect(resolveImageUrl("Assets\\subfolder/photo.jpg")).toBe(
        "/Assets/subfolder/photo.jpg"
      );
    });
  });

  describe("Localhost Path Handling", () => {
    test("should strip localhost:3000 prefix from paths", () => {
      expect(resolveImageUrl("http://localhost:3000/Assets/product.png")).toBe(
        "/Assets/product.png"
      );
      expect(
        resolveImageUrl("https://localhost:3000/images/photo.jpg")
      ).toBe("/images/photo.jpg");
    });

    test("should handle localhost with and without trailing slash", () => {
      expect(resolveImageUrl("http://localhost:3000/Assets/image.png")).toBe(
        "/Assets/image.png"
      );
      expect(resolveImageUrl("http://localhost:3000Assets/image.png")).toBe(
        "/Assets/image.png"
      );
    });
  });

  describe("Whitespace Handling", () => {
    test("should trim whitespace from input", () => {
      expect(resolveImageUrl("  /Assets/product.png  ")).toBe(
        "/Assets/product.png"
      );
      expect(resolveImageUrl("\n/Assets/image.png\t")).toBe(
        "/Assets/image.png"
      );
    });
  });

  describe("Special Cases", () => {
    test("should handle paths with query parameters", () => {
      expect(resolveImageUrl("/Assets/product.png?v=1")).toBe(
        "/Assets/product.png?v=1"
      );
    });

    test("should handle paths with hash fragments", () => {
      expect(resolveImageUrl("/Assets/product.png#section")).toBe(
        "/Assets/product.png#section"
      );
    });

    test("should handle numeric input", () => {
      expect(resolveImageUrl(12345)).toBe("/12345");
    });

    test("should handle edge case empty object conversion", () => {
      const result = resolveImageUrl({}.toString());
      expect(result).toBeDefined();
    });
  });
});
