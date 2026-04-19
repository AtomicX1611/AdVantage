/**
 * ==========================================
 * Redux Store Tests
 * ==========================================
 * Tests for Redux store configuration
 */

import store from "../../redux/store";
import { loginSuccess, logout, loginStart } from "../../redux/authSlice";

describe("Redux Store", () => {
  describe("Store Configuration", () => {
    test("should create store successfully", () => {
      expect(store).toBeDefined();
    });

    test("should have auth reducer", () => {
      const state = store.getState();
      expect(state.auth).toBeDefined();
    });

    test("should have correct initial state", () => {
      const state = store.getState();
      expect(state.auth).toEqual({
        user: null,
        isAuth: false,
        error: null,
        loading: true,
      });
    });
  });

  describe("Store Dispatch", () => {
    test("should dispatch actions", () => {
      const action = loginStart();
      store.dispatch(action);
      expect(store.getState().auth.loading).toBe(true);
    });

    test("should update state on dispatch", () => {
      const userData = { id: "1", email: "test@example.com" };
      store.dispatch(loginSuccess(userData));

      const state = store.getState();
      expect(state.auth.isAuth).toBe(true);
      expect(state.auth.user).toEqual(userData);
    });

    test("should handle logout", () => {
      // First login
      store.dispatch(loginSuccess({ id: "1", email: "test@example.com" }));
      expect(store.getState().auth.isAuth).toBe(true);

      // Then logout
      store.dispatch(logout());
      expect(store.getState().auth.isAuth).toBe(false);
      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe("Store Selectors", () => {
    test("should select auth state", () => {
      const state = store.getState();
      expect(state.auth).toBeDefined();
      expect(state.auth.isAuth).toBeDefined();
      expect(state.auth.user).toBeDefined();
      expect(state.auth.error).toBeDefined();
      expect(state.auth.loading).toBeDefined();
    });

    test("should select user from auth state", () => {
      const userData = { id: "1", email: "test@example.com" };
      store.dispatch(loginSuccess(userData));

      const state = store.getState();
      expect(state.auth.user).toEqual(userData);
    });

    test("should select auth status", () => {
      store.dispatch(logout());
      expect(store.getState().auth.isAuth).toBe(false);

      store.dispatch(loginSuccess({ id: "1", email: "test@example.com" }));
      expect(store.getState().auth.isAuth).toBe(true);
    });
  });

  describe("Store Subscription", () => {
    test("should notify subscribers on state change", () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.dispatch(loginStart());

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    test("should unsubscribe listener", () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.dispatch(loginStart());
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.dispatch(loginStart());
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Store Persistence", () => {
    test("should maintain state across multiple dispatches", () => {
      const userData = { id: "1", email: "test@example.com" };

      store.dispatch(loginStart());
      expect(store.getState().auth.loading).toBe(true);

      store.dispatch(loginSuccess(userData));
      expect(store.getState().auth.user).toEqual(userData);
      expect(store.getState().auth.loading).toBe(false);
    });
  });
});
