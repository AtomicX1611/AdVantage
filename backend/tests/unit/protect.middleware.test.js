import jwt from "jsonwebtoken";
import { checkToken, serializeUser, authorize } from "../../src/middlewares/protect.js";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.sendStatus = jest.fn(() => res);
  return res;
}

describe("protect middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("checkToken returns 403 when token is missing", () => {
    const req = { cookies: {} };
    const res = createRes();

    checkToken(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("checkToken attaches token and calls next", () => {
    const req = { cookies: { token: "abc" } };
    const res = createRes();
    const next = jest.fn();

    checkToken(req, res, next);

    expect(req.token).toBe("abc");
    expect(next).toHaveBeenCalled();
  });

  test("serializeUser returns 403 on invalid token", () => {
    const req = { cookies: { token: "bad" } };
    const res = createRes();

    jwt.verify.mockImplementation((token, secret, cb) => cb(new Error("bad token")));

    serializeUser(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  test("serializeUser sets req.user on valid token", () => {
    const req = { cookies: { token: "good" } };
    const res = createRes();
    const next = jest.fn();

    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { _id: "u1", role: "user" }));

    serializeUser(req, res, next);

    expect(req.user).toEqual({ _id: "u1", role: "user" });
    expect(next).toHaveBeenCalled();
  });

  test("authorize blocks disallowed role", () => {
    const middleware = authorize("admin");
    const req = { user: { role: "user" } };
    const res = createRes();

    middleware(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
