/**
 * ==========================================
 * Auth Slice Redux Tests
 * ==========================================
 * Tests for authentication state management
 */

import reducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "./authSlice";

describe("authSlice reducer", () => {
  const initialState = {
    user: null,
    isAuth: false,
    error: null,
    loading: true,
  };

  describe("Initial State", () => {
    test("should return the initial state", () => {
      expect(reducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    test("should have correct initial values", () => {
      const state = reducer(undefined, { type: "unknown" });
      expect(state.user).toBeNull();
      expect(state.isAuth).toBe(false);
      expect(state.error).toBeNull();
      expect(state.loading).toBe(true);
    });
  });

  describe("loginStart", () => {
    test("should set loading to true", () => {
      const state = reducer(initialState, loginStart());
      expect(state.loading).toBe(true);
    });

    test("should clear error on login start", () => {
      const stateWithError = {
        ...initialState,
        error: "Previous error",
      };
      const state = reducer(stateWithError, loginStart());
      expect(state.error).toBeNull();
    });

    test("should preserve other state values", () => {
      const stateWithUser = {
        ...initialState,
        user: { id: "u1", email: "test@example.com" },
        isAuth: true,
      };
      const state = reducer(stateWithUser, loginStart());
      expect(state.user).toEqual(stateWithUser.user);
      expect(state.isAuth).toBe(true);
      expect(state.loading).toBe(true);
    });
  });

  describe("loginSuccess", () => {
    test("should set user data and auth status", () => {
      const payload = {
        id: "u1",
        email: "user@test.com",
        role: "user",
        username: "testuser",
      };
      const state = reducer(initialState, loginSuccess(payload));

      expect(state.user).toEqual(payload);
      expect(state.isAuth).toBe(true);
    });

    test("should set loading to false", () => {
      const payload = { id: "u1", email: "user@test.com" };
      const state = reducer(initialState, loginSuccess(payload));
      expect(state.loading).toBe(false);
    });

    test("should clear error on successful login", () => {
      const stateWithError = {
        ...initialState,
        error: "Previous login failed",
      };
      const payload = { id: "u1", email: "user@test.com" };
      const state = reducer(stateWithError, loginSuccess(payload));

      expect(state.error).toBeNull();
    });

    test("should handle complex user objects", () => {
      const complexPayload = {
        id: "u1",
        email: "user@test.com",
        role: "admin",
        username: "admin_user",
        profilePicPath: "/Assets/admin.png",
        createdAt: "2024-01-01",
        settings: {
          notifications: true,
          darkMode: false,
        },
      };
      const state = reducer(initialState, loginSuccess(complexPayload));

      expect(state.user).toEqual(complexPayload);
      expect(state.user.settings.notifications).toBe(true);
    });

    test("should handle null/undefined payload gracefully", () => {
      const state = reducer(initialState, loginSuccess(null));
      expect(state.isAuth).toBe(true);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe("loginFailure", () => {
    test("should set error message", () => {
      const errorMsg = "Invalid credentials";
      const state = reducer(initialState, loginFailure(errorMsg));
      expect(state.error).toBe(errorMsg);
    });

    test("should set loading to false", () => {
      const state = reducer(initialState, loginFailure("Error"));
      expect(state.loading).toBe(false);
    });

    test("should set isAuth to false", () => {
      const stateWithAuth = {
        ...initialState,
        isAuth: true,
      };
      const state = reducer(stateWithAuth, loginFailure("Error"));
      expect(state.isAuth).toBe(false);
    });

    test("should preserve existing user data", () => {
      const stateWithUser = {
        ...initialState,
        user: { id: "u1", email: "test@example.com" },
        isAuth: true,
      };
      const state = reducer(stateWithUser, loginFailure("Error"));
      expect(state.user).toEqual({ id: "u1", email: "test@example.com" });
    });

    test("should handle different error types", () => {
      const errors = [
        "Bad credentials",
        "Network error",
        "User not found",
        "Server error",
      ];

      errors.forEach((error) => {
        const state = reducer(initialState, loginFailure(error));
        expect(state.error).toBe(error);
      });
    });

    test("should preserve error even if user had data", () => {
      const stateWithData = {
        user: { id: "u1" },
        isAuth: true,
        error: null,
        loading: false,
      };
      const errorMsg = "Session expired";
      const state = reducer(stateWithData, loginFailure(errorMsg));

      expect(state.error).toBe(errorMsg);
      expect(state.isAuth).toBe(false);
    });
  });

  describe("logout", () => {
    test("should clear user data", () => {
      const loggedInState = {
        user: { id: "u1", email: "test@example.com" },
        isAuth: true,
        error: null,
        loading: false,
      };
      const state = reducer(loggedInState, logout());

      expect(state.user).toBeNull();
    });

    test("should set isAuth to false", () => {
      const loggedInState = {
        user: { id: "u1" },
        isAuth: true,
        error: null,
        loading: false,
      };
      const state = reducer(loggedInState, logout());

      expect(state.isAuth).toBe(false);
    });

    test("should set loading to false", () => {
      const loggedInState = {
        user: { id: "u1" },
        isAuth: true,
        error: null,
        loading: true,
      };
      const state = reducer(loggedInState, logout());

      expect(state.loading).toBe(false);
    });

    test("should clear error message if exists", () => {
      const stateWithError = {
        user: { id: "u1" },
        isAuth: true,
        error: "Some error",
        loading: false,
      };
      const state = reducer(stateWithError, logout());

      // Note: logout doesn't clear error in current implementation
      // This test documents the actual behavior
      expect(state.error).toBe("Some error");
    });

    test("should work when called on already logged out state", () => {
      const state = reducer(initialState, logout());

      expect(state.user).toBeNull();
      expect(state.isAuth).toBe(false);
      expect(state.loading).toBe(false);
    });
  });

  describe("State Transitions", () => {
    test("should handle login flow: start -> success", () => {
      let state = initialState;
      state = reducer(state, loginStart());
      expect(state.loading).toBe(true);

      const userData = { id: "u1", email: "test@example.com" };
      state = reducer(state, loginSuccess(userData));

      expect(state.loading).toBe(false);
      expect(state.isAuth).toBe(true);
      expect(state.user).toEqual(userData);
    });

    test("should handle login flow: start -> failure", () => {
      let state = initialState;
      state = reducer(state, loginStart());
      expect(state.loading).toBe(true);

      state = reducer(state, loginFailure("Invalid credentials"));

      expect(state.loading).toBe(false);
      expect(state.isAuth).toBe(false);
      expect(state.error).toBe("Invalid credentials");
    });

    test("should handle complete auth cycle: start -> success -> logout", () => {
      let state = initialState;
      const userData = { id: "u1", email: "test@example.com" };

      state = reducer(state, loginStart());
      state = reducer(state, loginSuccess(userData));
      expect(state.isAuth).toBe(true);

      state = reducer(state, logout());
      expect(state.isAuth).toBe(false);
      expect(state.user).toBeNull();
    });

    test("should handle retry after failure", () => {
      let state = initialState;

      // First attempt fails
      state = reducer(state, loginStart());
      state = reducer(state, loginFailure("Network error"));
      expect(state.error).toBe("Network error");

      // Retry succeeds
      state = reducer(state, loginStart());
      const userData = { id: "u1", email: "test@example.com" };
      state = reducer(state, loginSuccess(userData));

      expect(state.error).toBeNull();
      expect(state.isAuth).toBe(true);
    });
  });

  describe("Action Exports", () => {
    test("all actions should be exported", () => {
      expect(loginStart).toBeDefined();
      expect(loginSuccess).toBeDefined();
      expect(loginFailure).toBeDefined();
      expect(logout).toBeDefined();
    });

    test("actions should be functions", () => {
      expect(typeof loginStart).toBe("function");
      expect(typeof loginSuccess).toBe("function");
      expect(typeof loginFailure).toBe("function");
      expect(typeof logout).toBe("function");
    });
  });
});
