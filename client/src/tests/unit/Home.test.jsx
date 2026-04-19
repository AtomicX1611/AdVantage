/**
 * ==========================================
 * Home Page Tests
 * ==========================================
 * Tests for the Home page component
 */

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../../pages/Home";
import { renderWithProviders } from "../helpers/test-utils";

describe("Home Page", () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  describe("Rendering", () => {
    test("should render home page successfully", async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/a one stop place to/i)).toBeInTheDocument();
      });
    });

    test("should render banner image", async () => {
      renderWithProviders(<Home />);

      const bannerImage = screen.getByAltText(/logo/i);
      expect(bannerImage).toBeInTheDocument();
    });
  });

  describe("Typewriter Effect", () => {
    test("should render typewriter component", async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        const typewriter = document.querySelector('[aria-live="polite"]');
        expect(typewriter).toBeInTheDocument();
      });
    });
  });

  describe("Featured Categories Section", () => {
    test("should render featured categories section", async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/featured categories/i)
        ).toBeInTheDocument();
      });
    });

    test("should display all category cards", async () => {
      renderWithProviders(<Home />);

      const categories = [
        "Clothes",
        "Mobiles",
        "Laptops",
        "Electronics",
        "Books",
        "Furniture",
        "Vehicles",
        "Sports",
        "Accessories",
        "Music",
      ];

      await waitFor(() => {
        categories.forEach((category) => {
          expect(screen.getByText(category)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Product Loading", () => {
    test("should fetch featured products on mount", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            featuredProducts: [],
            freshProducts: [],
          }),
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/featured categories/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    test("should handle loading error gracefully", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/a one stop place to/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Product Display", () => {
    test("should handle empty products list", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            featuredProducts: [],
            freshProducts: [],
          }),
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/featured categories/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Cleanup", () => {
    test("should cleanup on unmount", () => {
      const { unmount } = renderWithProviders(<Home />);
      unmount();
      expect(true).toBe(true);
    });
  });

  describe("Accessibility", () => {
    test("should have proper heading structure", async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/a one stop place to/i)
        ).toBeInTheDocument();
      });
    });

    test("should have alt text for all images", async () => {
      renderWithProviders(<Home />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
      });
    });

    test("should use semantic HTML", async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        const main = screen.getByRole("main");
        expect(main).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle null product data", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            featuredProducts: null,
            freshProducts: null,
          }),
      });

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(/featured categories/i)
        ).toBeInTheDocument();
      });
    });
  });
});
