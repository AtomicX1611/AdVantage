import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SellerRequests from "../components/SellerHome/SellerRequests";

jest.mock("../config/api.config", () => ({
  __esModule: true,
  default: { BACKEND_URL: "http://localhost:3000" },
  API_CONFIG: { BACKEND_URL: "http://localhost:3000" },
}));

jest.mock("../utils/razorpay", () => ({
  loadRazorpayScript: jest.fn().mockResolvedValue(true),
}));

describe("SellerRequests component", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows already accepted button disabled for locked request", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        products: [
          {
            _id: "p1",
            name: "Phone",
            soldTo: null,
            sellerAcceptedTo: "b1",
            images: [],
            requests: [
              {
                _id: "r1",
                buyer: { _id: "b1", username: "Buyer" },
                biddingPrice: 1000,
                sellerStakeStatus: "Locked",
              },
            ],
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <SellerRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/view requests/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/view requests/i));

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /already accepted/i });
      expect(btn).toBeDisabled();
    });
  });
});
