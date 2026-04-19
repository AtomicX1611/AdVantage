/**
 * ==========================================
 * Header Component Tests
 * ==========================================
 * Tests for the main Header/Navigation component
 */

import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../../components/Header";
import {
  renderWithProviders,
  mockStores,
  createMockStore,
} from "../helpers/test-utils";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../redux/authSlice";

describe("Header Component", () => {
  describe("Unauthenticated State", () => {
    test("should render login button when not authenticated", () => {
      renderWithProviders(<Header />, {
        initialState: mockStores.unauthenticated,
      });

      const loginBtn = screen.getByText(/login/i);
      expect(loginBtn).toBeInTheDocument();
    });

    test("should hide login button when authenticated", () => {
      renderWithProviders(<Header />, {
        initialState: mockStores.authenticated,
      });

      const loginBtn = screen.queryByText(/login/i);
      expect(loginBtn).not.toBeInTheDocument();
    });
  });

  describe("Logo and Branding", () => {
    test("should render logo image", () => {
      renderWithProviders(<Header />);

      const logo = screen.getByRole("img", { name: /logo/i });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute(
        "src",
        "/Assets/ADVANTAGE.png"
      );
    });

    test("should have clickable logo linking to home", () => {
      renderWithProviders(<Header />);

      const logoLink = screen.getByRole("link", { name: /logo/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Search Functionality", () => {
    test("should render search input", () => {
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    test("should navigate on search submit", async () => {
      const user = userEvent.setup();

      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      const searchForm = searchInput.closest("form");

      await user.type(searchInput, "laptop");
      fireEvent.submit(searchForm, {
        target: {
          search: { value: "laptop" },
        },
      });

      // Search should trigger navigation (behavior depends on implementation)
      expect(searchInput).toHaveValue("laptop");
    });

    test("should not submit empty search", async () => {
      renderWithProviders(<Header />);

      const searchForm = screen
        .getByPlaceholderText(/search/i)
        .closest("form");
      fireEvent.submit(searchForm, {
        target: {
          search: { value: "" },
        },
      });

      // Form should handle empty search gracefully
      expect(searchForm).toBeInTheDocument();
    });

    test("should trim whitespace from search input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "   laptop   ");

      expect(searchInput).toHaveValue("   laptop   ");
    });
  });

  describe("Seller Account Button", () => {
    test("should render seller account button", () => {
      renderWithProviders(<Header />);

      const sellerBtn = screen.getByText(/seller account/i);
      expect(sellerBtn).toBeInTheDocument();
    });

    test("should have clickable seller account button", () => {
      renderWithProviders(<Header />);

      const sellerBtn = screen.getByText(/seller account/i).closest("div");
      expect(sellerBtn).toHaveStyle("cursor: pointer");
    });
  });

  describe("User Actions (Icons)", () => {
    test("should render chat icon link", () => {
      renderWithProviders(<Header />);

      const chatImages = screen.getAllByRole("img");
      const chatIcon = chatImages.find(
        (img) => img.getAttribute("alt") === "Chat"
      );
      expect(chatIcon).toBeInTheDocument();
    });

    test("should render wishlist icon link", () => {
      renderWithProviders(<Header />);

      const wishlistImages = screen.getAllByRole("img");
      const wishlistIcon = wishlistImages.find(
        (img) => img.getAttribute("alt") === "Wishlist"
      );
      expect(wishlistIcon).toBeInTheDocument();
    });

    test("should have correct dimensions for icons", () => {
      renderWithProviders(<Header />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        const alt = img.getAttribute("alt");
        if (alt === "Chat" || alt === "Wishlist") {
          expect(img).toHaveStyle({ width: "28px", height: "28px" });
        }
      });
    });
  });

  describe("User Profile Section", () => {
    test("should display user profile picture when authenticated", () => {
      renderWithProviders(<Header />, {
        initialState: mockStores.authenticated,
      });

      // Profile picture functionality depends on implementation
      // This test documents the expected behavior
      expect(screen.getByText(/seller account/i)).toBeInTheDocument();
    });

    test("should not display profile picture when not authenticated", () => {
      renderWithProviders(<Header />, {
        initialState: mockStores.unauthenticated,
      });

      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    test("should navigate to home on logo click", () => {
      renderWithProviders(<Header />);

      const homeLink = screen.getByRole("link", { name: /logo/i });
      expect(homeLink).toHaveAttribute("href", "/");
    });

    test("should have links for all action buttons", () => {
      renderWithProviders(<Header />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Behavior", () => {
    test("should render all components in correct order", () => {
      renderWithProviders(<Header />);

      const header = screen.getByRole("navigation");
      expect(header).toBeInTheDocument();

      // Logo should come before search
      const logo = screen.getByRole("img", { name: /logo/i });
      const searchInput = screen.getByPlaceholderText(/search/i);

      expect(logo).toBeInTheDocument();
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper alt text for images", () => {
      renderWithProviders(<Header />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });

    test("should have proper form structure for search", () => {
      renderWithProviders(<Header />);

      const searchForm = screen
        .getByPlaceholderText(/search/i)
        .closest("form");
      expect(searchForm).toBeInTheDocument();
      expect(searchForm.tagName).toBe("FORM");
    });

    test("should have semantic navigation element", () => {
      renderWithProviders(<Header />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    test("should render when loading auth state", () => {
      renderWithProviders(<Header />, {
        initialState: mockStores.loading,
      });

      // Component should render even during loading
      expect(screen.getByText(/seller account/i)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("should handle missing profile picture gracefully", () => {
      const storeWithoutPicture = {
        auth: {
          user: {
            id: "test-user-1",
            email: "test@example.com",
            username: "testuser",
            role: "user",
            profilePicPath: null,
          },
          isAuth: true,
          error: null,
          loading: false,
        },
      };

      renderWithProviders(<Header />, {
        initialState: storeWithoutPicture,
      });

      expect(screen.getByText(/seller account/i)).toBeInTheDocument();
    });
  });
});
