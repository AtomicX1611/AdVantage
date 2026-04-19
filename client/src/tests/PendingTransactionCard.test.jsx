import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PendingTransactionCard from "../components/PendingTransactionCard";

describe("PendingTransactionCard", () => {
  test("calls onPay and onNotInterested callbacks", () => {
    const onPay = jest.fn();
    const onNotInterested = jest.fn();

    const item = {
      _id: "p1",
      name: "Phone",
      price: 1200,
      sellerAcceptedTo: "b1",
      requests: [
        { buyer: { _id: "b1" }, biddingPrice: 1000 },
      ],
      seller: { username: "seller" },
      images: [],
      category: "Mobiles",
      city: "Hyderabad",
      district: "Hyderabad",
      state: "Telangana",
    };

    render(<PendingTransactionCard item={item} onPay={onPay} onNotInterested={onNotInterested} />);

    fireEvent.click(screen.getByRole("button", { name: /pay now/i }));
    fireEvent.click(screen.getByRole("button", { name: /not interested/i }));

    expect(onPay).toHaveBeenCalledWith(item);
    expect(onNotInterested).toHaveBeenCalledWith(item);
  });
});
