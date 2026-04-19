import reducer, { loginStart, loginSuccess, loginFailure, logout } from "./authSlice";

describe("authSlice reducer", () => {
  const initialState = {
    user: null,
    isAuth: false,
    error: null,
    loading: true,
  };

  test("should handle loginStart", () => {
    const state = reducer(initialState, loginStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test("should handle loginSuccess", () => {
    const payload = { id: "u1", email: "user@test.com", role: "user" };
    const state = reducer(initialState, loginSuccess(payload));

    expect(state.loading).toBe(false);
    expect(state.isAuth).toBe(true);
    expect(state.user).toEqual(payload);
  });

  test("should handle loginFailure", () => {
    const state = reducer(initialState, loginFailure("bad credentials"));

    expect(state.loading).toBe(false);
    expect(state.isAuth).toBe(false);
    expect(state.error).toBe("bad credentials");
  });

  test("should handle logout", () => {
    const loggedIn = {
      user: { id: "u1" },
      isAuth: true,
      error: null,
      loading: false,
    };

    const state = reducer(loggedIn, logout());

    expect(state.user).toBeNull();
    expect(state.isAuth).toBe(false);
    expect(state.loading).toBe(false);
  });
});
