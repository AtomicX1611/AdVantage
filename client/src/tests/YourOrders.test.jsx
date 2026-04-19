import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyOrders from "../pages/YourOrders.page";

jest.mock("../config/api.config", () => ({
  __esModule: true,
  default: { BACKEND_URL: "http://localhost:3000" },
  API_CONFIG: { BACKEND_URL: "http://localhost:3000" },
}));

describe("YourOrders page", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows mark as received for paid pending order", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
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

    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark as received/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /dispute order/i })).not.toBeInTheDocument();
  });

  test("shows dispute for delivered order within window", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        orders: [
          {
            _id: "o2",
            status: "paid",
            deliveryStatus: "Delivered",
            timerTriggered48Hour: false,
            deliveredAt: new Date().toISOString(),
            amount: 1000,
            productId: { _id: "p2", name: "Laptop", images: [] },
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /dispute order/i })).toBeInTheDocument();
    });
  });
});
