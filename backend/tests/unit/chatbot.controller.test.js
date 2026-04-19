import {
  chatController,
  endThreadController,
} from "../../src/controllers/chatbot.controller.js";

import {
  askChatbotService,
  endChatThreadService,
} from "../../src/services/chatbot.service.js";

jest.mock("../../src/services/chatbot.service.js", () => ({
  askChatbotService: jest.fn(),
  endChatThreadService: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("chatbot.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("chatController validates non-empty message", async () => {
    const req = { body: { message: "" } };
    const res = mockRes();

    await chatController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("chatController uses provided thread_id", async () => {
    const req = { body: { message: "hello", thread_id: "thread-1" } };
    const res = mockRes();

    askChatbotService.mockResolvedValue("ok");

    await chatController(req, res, jest.fn());

    expect(askChatbotService).toHaveBeenCalledWith("hello", "thread-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("chatController creates thread_id when missing", async () => {
    const req = { body: { message: "hello" } };
    const res = mockRes();

    askChatbotService.mockResolvedValue("ok");

    await chatController(req, res, jest.fn());

    expect(askChatbotService).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, thread_id: expect.any(String), response: "ok" })
    );
  });

  test("endThreadController validates required thread id", async () => {
    const req = { body: {}, params: {} };
    const res = mockRes();

    await endThreadController(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("endThreadController uses params threadId and ends thread", async () => {
    const req = { body: {}, params: { threadId: "thread-2" } };
    const res = mockRes();

    endChatThreadService.mockResolvedValue(undefined);

    await endThreadController(req, res, jest.fn());

    expect(endChatThreadService).toHaveBeenCalledWith("thread-2");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
