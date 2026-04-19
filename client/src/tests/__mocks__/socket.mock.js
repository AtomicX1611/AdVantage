/**
 * ==========================================
 * Socket.io Mock
 * ==========================================
 * Provides mock socket.io client for testing
 * Includes event emitter functionality
 */

export const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  connect: jest.fn(),
  connected: true,
  id: "mock-socket-id",
};

export const socketIOClientMock = jest.fn(() => mockSocket);

// Setup handlers for socket events
const eventHandlers = {};

mockSocket.on.mockImplementation((event, handler) => {
  if (!eventHandlers[event]) {
    eventHandlers[event] = [];
  }
  eventHandlers[event].push(handler);
});

mockSocket.off.mockImplementation((event, handler) => {
  if (eventHandlers[event]) {
    eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler);
  }
});

mockSocket.emit.mockImplementation((event, data) => {
  if (eventHandlers[event]) {
    eventHandlers[event].forEach((handler) => handler(data));
  }
});

// Export helper to trigger socket events in tests
export const triggerSocketEvent = (event, data) => {
  if (eventHandlers[event]) {
    eventHandlers[event].forEach((handler) => handler(data));
  }
};

// Export helper to clear socket events
export const clearSocketEvents = () => {
  Object.keys(eventHandlers).forEach((key) => {
    eventHandlers[key] = [];
  });
};
