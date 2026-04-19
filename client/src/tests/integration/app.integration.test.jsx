import React, { useContext } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockStores } from "../helpers/test-utils";
import Home from "../../pages/Home";
import Header from "../../components/Header";
import LoginPage from "../../pages/LoginPage";
import CurrentUserContextProvider, {
  CurrentUserContext,
} from "../../context/CurrentUserContextProvider";
import { loginSuccess, logout } from "../../redux/authSlice";

describe("Application Integration", () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test("login flow succeeds with valid credentials", async () => {
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

  test("login flow shows backend error on invalid credentials", async () => {
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

  test("home page renders featured categories", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/featured categories/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Clothes")).toBeInTheDocument();
  });

  test("redux auth state transitions through login and logout actions", () => {
    const { store } = renderWithProviders(<LoginPage />);

    expect(store.getState().auth.isAuth).toBe(false);

    store.dispatch(loginSuccess({ id: "1", email: "test@example.com" }));
    expect(store.getState().auth.isAuth).toBe(true);

    store.dispatch(logout());
    expect(store.getState().auth.isAuth).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });

  test("context state updates inside provider", async () => {
    const user = userEvent.setup();

    const ContextConsumer = () => {
      const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);
      return (
        <div>
          <p data-testid="ctx-user">{currentUser2 ? currentUser2.name : "No user"}</p>
          <button data-testid="ctx-set" onClick={() => setCurrentUser2({ name: "John Doe" })}>
            Set User
          </button>
        </div>
      );
    };

    renderWithProviders(
      <CurrentUserContextProvider>
        <ContextConsumer />
      </CurrentUserContextProvider>
    );

    expect(screen.getByTestId("ctx-user")).toHaveTextContent("No user");

    await user.click(screen.getByTestId("ctx-set"));

    await waitFor(() => {
      expect(screen.getByTestId("ctx-user")).toHaveTextContent("John Doe");
    });
  });

  test("authenticated state hides login button in Header", () => {
    renderWithProviders(<Header />, { initialState: mockStores.authenticated });

    expect(screen.queryByText(/^login$/i)).not.toBeInTheDocument();
  });

  test("unauthenticated state shows login button in Header", () => {
    renderWithProviders(<Header />, { initialState: mockStores.unauthenticated });

    expect(screen.getByText(/^login$/i)).toBeInTheDocument();
  });

  test("home renders basic structure even when product fetch fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/a one stop place to/i)).toBeInTheDocument();
    });
  });
});
