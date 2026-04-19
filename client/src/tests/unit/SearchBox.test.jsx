import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBox from "../../components/SearchBox";

describe("SearchBox Component", () => {
  test("renders search input", () => {
    render(<SearchBox />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  test("uses expected form action and method", () => {
    const { container } = render(<SearchBox />);

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("action", "/search/noFilter");
    expect(form).toHaveAttribute("method", "get");
  });

  test("includes hidden submit button for keyboard/accessibility support", () => {
    const { container } = render(<SearchBox />);

    const submitBtn = container.querySelector("#search-btn");
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveAttribute("type", "submit");
    expect(submitBtn).toHaveTextContent("Search");
    expect(submitBtn).toHaveStyle({ display: "none" });
  });

  test("input has stable id, name and type", () => {
    render(<SearchBox />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("id", "search-products");
    expect(input).toHaveAttribute("name", "searchValue");
    expect(input).toHaveAttribute("type", "search");
  });

  test("accepts normal search text", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "laptop");

    expect(input).toHaveValue("laptop");
  });

  test("accepts special characters and numbers", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "iphone 15 pro-max @ 999$");

    expect(input).toHaveValue("iphone 15 pro-max @ 999$");
  });

  test("supports long values", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByRole("searchbox");
    const longQuery = "a".repeat(200);
    await user.type(input, longQuery);

    expect(input).toHaveValue(longQuery);
  });

  test("can be cleared", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "to-clear");
    await user.clear(input);

    expect(input).toHaveValue("");
  });
});
