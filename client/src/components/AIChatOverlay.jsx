import { useEffect, useRef, useState } from "react";
import classes from "../styles/aichatoverlay.module.css";
import { API_CONFIG } from "../config/api.config";

const makeMessage = (role, text) => ({
  id: `${Date.now()}-${Math.random()}`,
  role,
  text,
});

const AIChatOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const endRef = useRef(null);
  const threadIdRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  const deleteThread = async (id, useBeacon = false) => {
    if (!id) {
      return;
    }

    const endpoint = `${API_CONFIG.BACKEND_URL}/chatbot/chat/end`;

    if (useBeacon && navigator.sendBeacon) {
      const payload = new Blob([JSON.stringify({ thread_id: id })], {
        type: "application/json",
      });
      navigator.sendBeacon(endpoint, payload);
      return;
    }

    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ thread_id: id }),
    });
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      const activeThreadId = threadIdRef.current;
      if (activeThreadId) {
        void deleteThread(activeThreadId, true);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  const startNewThread = async () => {
    if (threadIdRef.current) {
      try {
        await deleteThread(threadIdRef.current);
      } catch {
        // silent cleanup failure is acceptable; backend TTL handles leftovers
      }
    }

    setThreadId(null);
    setMessages([]);
    setErrorText("");
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setErrorText("");
    setInput("");
    setMessages((prev) => [...prev, makeMessage("user", trimmed)]);
    setIsLoading(true);

    try {
      const payload = {
        message: trimmed,
        thread_id: threadId || undefined,
      };

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Chat request failed");
      }

      const botText =
        typeof data.response === "string" && data.response.trim()
          ? data.response
          : "I could not generate a response.";

      setThreadId(data.thread_id || threadId);
      setMessages((prev) => [...prev, makeMessage("assistant", botText)]);
    } catch (error) {
      const fallback = error?.message || "Unable to reach AI service";
      setErrorText(fallback);
      setMessages((prev) => [
        ...prev,
        makeMessage("assistant", "I am having trouble right now. Please try again."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className={classes.triggerButton}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI chat"
      >
        💬 Help
      </button>
    );
  }

  return (
    <aside className={classes.panel} aria-label="AI chat overlay">
      <div className={classes.header}>
        <div>
          <h3>AI Assistant</h3>
          <p>{threadId ? `Thread: ${threadId}` : "Thread: new"}</p>
        </div>
        <div className={classes.headerActions}>
          <button type="button" onClick={startNewThread}>
            New Thread
          </button>
          <button type="button" onClick={() => setIsOpen(false)}>
            Minimize
          </button>
        </div>
      </div>

      <div className={classes.messages}>
        {messages.length === 0 ? (
          <div className={classes.welcome}>
            Ask anything about products, orders, or reselling suggestions.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${classes.message} ${
                msg.role === "user" ? classes.userMessage : classes.botMessage
              }`}
            >
              {msg.text}
            </div>
          ))
        )}

        {isLoading && <div className={classes.statusText}>Thinking...</div>}
        {errorText ? <div className={classes.errorText}>{errorText}</div> : null}
        <div ref={endRef} />
      </div>

      <div className={classes.inputRow}>
        <textarea
          className={classes.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Type your message"
          rows={2}
        />
        <button
          type="button"
          className={classes.sendButton}
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </aside>
  );
};

export default AIChatOverlay;
