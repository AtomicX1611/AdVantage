import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import SellerOrders from "../components/SellerHome/SellerOrders";

jest.mock("../config/api.config", () => ({
  __esModule: true,
  default: { BACKEND_URL: "http://localhost:3000" },
  API_CONFIG: { BACKEND_URL: "http://localhost:3000" },
}));

describe("SellerOrders component", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders paid orders requiring seller action", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        orders: [
          {
            _id: "o1",
            status: "paid",
            deliveryStatus: "Pending",
            amount: 1000,
            productId: { _id: "p1", name: "Phone", images: [] },
          },
        ],
      }),
    });

    render(<SellerOrders />);

    await waitFor(() => {
      expect(screen.getByText(/paid orders requiring seller action/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /not interested \(cancel order\)/i })).toBeInTheDocument();
  });

  test("shows validation alert when shipping data is incomplete", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        orders: [
          {
            _id: "o2",
            status: "paid",
            deliveryStatus: "Pending",
            amount: 1000,
            productId: { _id: "p2", name: "Laptop", images: [] },
          },
        ],
      }),
    });

    render(<SellerOrders />);

    await waitFor(() => {
      expect(screen.getByText(/submit delivery details and ship/i)).toBeInTheDocument();
    });

    screen.getByText(/submit delivery details and ship/i).click();
    expect(window.alert).toHaveBeenCalledWith("Please provide both AWB Code and Courier Name.");
  });
});
