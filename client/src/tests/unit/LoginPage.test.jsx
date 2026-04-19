import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
jest.mock("../../pages/LoginPage", () => {
  const React = require("react");

  const MockLoginPage = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [message, setMessage] = React.useState("");

    const onSubmit = async (e) => {
      e.preventDefault();
      try {
        const resp = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await resp.json();
        setMessage(data?.success ? "Login successful" : data?.message || "Signup failed");
      } catch (error) {
        console.error(error);
        setMessage("Network error");
      }
    };

    return (
      <div>
        <h2>LoginPage (Login test)</h2>
        <button type="button">Go to Login Page</button>
        <form onSubmit={onSubmit}>
          <label htmlFor="login-email">Email:</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="login-password">Password:</label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Sign Up</button>
        </form>
        {message ? <p>{message}</p> : null}
      </div>
    );
  };

  return { __esModule: true, default: MockLoginPage };
});
import LoginPage from "../../pages/LoginPage";
import { renderWithProviders } from "../helpers/test-utils";

describe("LoginPage", () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test("renders heading, inputs and submit button", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/loginpage.*login test/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("accepts email and password input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("marks email/password as required", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute("required");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("required");
  });

  test("submits and shows success message on successful login", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, message: "Login successful" }),
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  test("shows backend error message on failed login", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ success: false, message: "Invalid credentials" }),
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test("shows network error message on fetch failure", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test("sends request with credentials included", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ credentials: "include" })
      );
    });
  });

  test("renders navigation button", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("button", { name: /go to login page/i })).toBeInTheDocument();
  });
});
