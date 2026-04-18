import {
  createContact,
  getContacts,
  inboxController,
  saveController,
} from "../../src/controllers/chat.controller.js";

import {
  createContactService,
  getContactsService,
  inboxService,
  saveService,
} from "../../src/services/chat.service.js";

jest.mock("../../src/services/chat.service.js", () => ({
  getContactsService: jest.fn(),
  createContactService: jest.fn(),
  saveService: jest.fn(),
  inboxService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("chat.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getContacts returns 500 when service fails", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();

    getContactsService.mockResolvedValue({ success: false, message: "failed" });

    await getContacts(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getContacts returns contacts on success", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();

    getContactsService.mockResolvedValue({
      success: true,
      contacts: [{ _id: "c1" }],
      userName: "user",
      myAccount: {},
    });

    await getContacts(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("createContact validates required ids", async () => {
    const req = { user: { _id: "u1" }, params: {} };
    const res = mockRes();

    await createContact(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createContact returns 200 on service success", async () => {
    const req = { user: { _id: "u1" }, params: { id: "u2" } };
    const res = mockRes();

    createContactService.mockResolvedValue({ success: true });

    await createContact(req, res, jest.fn());

    expect(createContactService).toHaveBeenCalledWith("u1", "u2");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("inboxController validates required params", async () => {
    const req = { user: { _id: "u1" }, params: {} };
    const res = mockRes();

    await inboxController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("inboxController returns service status on failure", async () => {
    const req = { user: { _id: "u1" }, params: { id: "u2" } };
    const res = mockRes();

    inboxService.mockResolvedValue({ success: false, status: 404, message: "not found" });

    await inboxController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("saveController returns service failure", async () => {
    const req = { user: { _id: "u1" }, params: { id: "u2" }, body: { newMessage: "hello" } };
    const res = mockRes();

    saveService.mockResolvedValue({ success: false, status: 500, message: "error" });

    await saveController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("saveController returns 200 when save succeeds", async () => {
    const req = { user: { _id: "u1" }, params: { id: "u2" }, body: { newMessage: "hello" } };
    const res = mockRes();

    saveService.mockResolvedValue({ success: true, message: "saved" });

    await saveController(req, res, jest.fn());

    expect(saveService).toHaveBeenCalledWith("u1", "u2", "hello");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
