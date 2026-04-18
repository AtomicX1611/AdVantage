import {
  createContactService,
  getContactsService,
  inboxService,
  saveService,
} from "../../src/services/chat.service.js";

import { createContactDao, fetchContacts, inboxDao, saveDao } from "../../src/daos/chat.dao.js";

jest.mock("../../src/daos/chat.dao.js", () => ({
  createContactDao: jest.fn(),
  fetchContacts: jest.fn(),
  generateChatId: jest.fn(),
  inboxDao: jest.fn(),
  saveDao: jest.fn(),
}));

describe("chat.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getContactsService delegates to dao", async () => {
    fetchContacts.mockResolvedValue({ success: true, contacts: [] });

    const result = await getContactsService("u1");

    expect(fetchContacts).toHaveBeenCalledWith("u1");
    expect(result.success).toBe(true);
  });

  test("createContactService delegates to dao", async () => {
    createContactDao.mockResolvedValue({ success: true });

    const result = await createContactService("u1", "u2");

    expect(createContactDao).toHaveBeenCalledWith("u1", "u2");
    expect(result.success).toBe(true);
  });

  test("inboxService delegates to dao", async () => {
    inboxDao.mockResolvedValue({ success: true, status: 200, messages: [] });

    const result = await inboxService("u1", "u2");

    expect(inboxDao).toHaveBeenCalledWith("u1", "u2");
    expect(result.success).toBe(true);
  });

  test("saveService delegates to dao", async () => {
    saveDao.mockResolvedValue({ success: true, status: 200, message: "saved" });

    const result = await saveService("u1", "u2", "hello");

    expect(saveDao).toHaveBeenCalledWith("u1", "u2", "hello");
    expect(result.success).toBe(true);
  });
});
