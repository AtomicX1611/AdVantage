jest.mock("../config/api.config", () => ({
  __esModule: true,
  default: {
    BACKEND_URL: "http://test-backend",
  },
}));

import { checkAuth, authFetch } from "./authCheck";

describe("auth utils", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("checkAuth returns false and redirects on 403", async () => {
    const navigate = jest.fn();
    fetch.mockResolvedValue({ status: 403, ok: false });

    const result = await checkAuth("/user/wishlist", navigate);

    expect(result).toBe(false);
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  test("checkAuth returns true on 200", async () => {
    fetch.mockResolvedValue({ status: 200, ok: true });

    const result = await checkAuth("/user/wishlist", jest.fn());

    expect(result).toBe(true);
  });

  test("authFetch injects credentials and content-type", async () => {
    fetch.mockResolvedValue({ status: 200, ok: true });

    await authFetch("http://test-backend/auth/me", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "http://test-backend/auth/me",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  test("authFetch redirects on 403 when navigate provided", async () => {
    const navigate = jest.fn();
    fetch.mockResolvedValue({ status: 403, ok: false });

    await authFetch("http://test-backend/auth/me", {}, navigate);

    expect(navigate).toHaveBeenCalledWith("/login");
  });
});
