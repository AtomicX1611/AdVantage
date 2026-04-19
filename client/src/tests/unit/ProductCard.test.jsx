import React from "react";
import { screen } from "@testing-library/react";
import ProductCard from "../../components/ProductCard";
import { renderWithProviders } from "../helpers/test-utils";

describe("ProductCard Component", () => {
  const baseProduct = {
    _id: "prod-1",
    name: "Test Product",
    price: 1299,
    images: ["/Assets/product.png"],
  };

  test("renders product name", () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  test("renders formatted price", () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    expect(screen.getByText("₹1,299")).toBeInTheDocument();
  });

  test("renders provided image when images exist", () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    const image = screen.getByRole("img", { name: /test product/i });
    expect(image).toHaveAttribute("src", "/Assets/product.png");
  });

  test("falls back to placeholder image when images are missing", () => {
    const product = { ...baseProduct, images: [] };
    renderWithProviders(<ProductCard product={product} />);
    const image = screen.getByRole("img", { name: /test product/i });
    expect(image).toHaveAttribute("src", "/Assets/placeholder.png");
  });

  test("links to product detail route", () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/product/prod-1");
  });

  test("shows purchased badge", () => {
    renderWithProviders(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/purchased/i)).toBeInTheDocument();
  });

  test("still renders card details when isRental is true", () => {
    const rentalProduct = { ...baseProduct, isRental: true };
    renderWithProviders(<ProductCard product={rentalProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("₹1,299")).toBeInTheDocument();
  });

  test("uses generic alt text when product name is missing", () => {
    const namelessProduct = {
      ...baseProduct,
      name: "",
      images: ["/Assets/product.png"],
    };
    renderWithProviders(<ProductCard product={namelessProduct} />);
    expect(screen.getByRole("img", { name: "Product" })).toBeInTheDocument();
  });
});
