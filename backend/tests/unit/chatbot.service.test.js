import {
  askChatbotService,
  endChatThreadService,
} from "../../src/services/chatbot.service.js";

import { markThreadSeen, readMessageText, cleanupExpiredThreads } from "../../src/helpers/chatbot.helper.js";
import { initializeGraph } from "../../src/helpers/graph.helper.js";

var mockInvoke;
var mockDeleteThread;

jest.mock("../../src/helpers/graph.helper.js", () => ({
  initializeGraph: jest.fn(() => {
    mockInvoke = jest.fn();
    mockDeleteThread = jest.fn();
    return {
      app: { invoke: mockInvoke },
      checkpointer: { deleteThread: mockDeleteThread },
    };
  }),
}));

jest.mock("../../src/helpers/chatbot.helper.js", () => ({
  markThreadSeen: jest.fn(),
  readMessageText: jest.fn(),
  cleanupExpiredThreads: jest.fn(),
}));

describe("chatbot.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("askChatbotService invokes graph and returns parsed text", async () => {
    mockInvoke.mockResolvedValue({ messages: [{ content: "ignored" }, { content: "ai response" }] });
    readMessageText.mockReturnValue("parsed response");

    const result = await askChatbotService("hello", "thread-1");

    expect(markThreadSeen).toHaveBeenCalledWith("thread-1", expect.any(Map));
    expect(mockInvoke).toHaveBeenCalled();
    expect(readMessageText).toHaveBeenCalledWith("ai response");
    expect(result).toBe("parsed response");
  });

  test("endChatThreadService ignores invalid thread id", async () => {
    await endChatThreadService(null);

    expect(mockDeleteThread).not.toHaveBeenCalled();
  });

  test("endChatThreadService deletes valid thread", async () => {
    mockDeleteThread.mockResolvedValue(undefined);

    await endChatThreadService("thread-2");

    expect(mockDeleteThread).toHaveBeenCalledWith("thread-2");
  });
});
