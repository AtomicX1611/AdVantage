import React, { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrentUserContextProvider, {
  CurrentUserContext,
} from "../../context/CurrentUserContextProvider";

const Consumer = () => {
  const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);

  return (
    <div>
      <p data-testid="user-info">
        {currentUser2 ? `User: ${currentUser2.name}` : "No User"}
      </p>
      <button
        data-testid="set-user-btn"
        onClick={() => setCurrentUser2({ id: "1", name: "John Doe" })}
      > 
        Set User
      </button>
      <button data-testid="clear-user-btn" onClick={() => setCurrentUser2(null)}>
        Clear User
      </button>
    </div>
  );
};

describe("CurrentUserContextProvider", () => {
  test("renders children", () => {
    render(
      <CurrentUserContextProvider>
        <div data-testid="child">Child</div>
      </CurrentUserContextProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("provides undefined initial user", () => {
    render(
      <CurrentUserContextProvider>
        <Consumer />
      </CurrentUserContextProvider>
    );

    expect(screen.getByTestId("user-info")).toHaveTextContent("No User");
  });

  test("updates user when setCurrentUser2 is called", async () => {
    const user = userEvent.setup();

    render(
      <CurrentUserContextProvider>
        <Consumer />
      </CurrentUserContextProvider>
    );

    await user.click(screen.getByTestId("set-user-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toHaveTextContent("User: John Doe");
    });
  });

  test("clears user when null is set", async () => {
    const user = userEvent.setup();

    render(
      <CurrentUserContextProvider>
        <Consumer />
      </CurrentUserContextProvider>
    );

    await user.click(screen.getByTestId("set-user-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toHaveTextContent("User: John Doe");
    });

    await user.click(screen.getByTestId("clear-user-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("user-info")).toHaveTextContent("No User");
    });
  });

  test("handles complex user objects", async () => {
    const user = userEvent.setup();

    const ComplexConsumer = () => {
      const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);
      return (
        <div>
          {currentUser2 && (
            <>
              <p data-testid="user-id">{currentUser2.id}</p>
              <p data-testid="user-email">{currentUser2.email}</p>
              <p data-testid="user-role">{currentUser2.role}</p>
            </>
          )}
          <button
            data-testid="set-complex-user"
            onClick={() =>
              setCurrentUser2({
                id: "123",
                name: "Jane Doe",
                email: "jane@example.com",
                role: "admin",
              })
            }
          >
            Set Complex User
          </button>
        </div>
      );
    };

    render(
      <CurrentUserContextProvider>
        <ComplexConsumer />
      </CurrentUserContextProvider>
    );

    await user.click(screen.getByTestId("set-complex-user"));

    await waitFor(() => {
      expect(screen.getByTestId("user-id")).toHaveTextContent("123");
      expect(screen.getByTestId("user-email")).toHaveTextContent("jane@example.com");
      expect(screen.getByTestId("user-role")).toHaveTextContent("admin");
    });
  });

  test("isolates state between provider instances", async () => {
    const user = userEvent.setup();

    render(
      <>
        <CurrentUserContextProvider>
          <Consumer />
        </CurrentUserContextProvider>
        <CurrentUserContextProvider>
          <Consumer />
        </CurrentUserContextProvider>
      </>
    );

    const setButtons = screen.getAllByTestId("set-user-btn");
    await user.click(setButtons[0]);

    const userInfos = screen.getAllByTestId("user-info");
    await waitFor(() => {
      expect(userInfos[0]).toHaveTextContent("User: John Doe");
      expect(userInfos[1]).toHaveTextContent("No User");
    });
  });

  test("last rapid update wins", async () => {
    const user = userEvent.setup();

    const RapidConsumer = () => {
      const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);
      return (
        <div>
          <p data-testid="rapid-user">
            {currentUser2 ? `User: ${currentUser2.name}` : "No User"}
          </p>
          <button
            data-testid="rapid-update"
            onClick={() => {
              for (let i = 0; i < 5; i += 1) {
                setCurrentUser2({ name: `User ${i}` });
              }
            }}
          >
            Rapid
          </button>
        </div>
      );
    };

    render(
      <CurrentUserContextProvider>
        <RapidConsumer />
      </CurrentUserContextProvider>
    );

    await user.click(screen.getByTestId("rapid-update"));

    await waitFor(() => {
      expect(screen.getByTestId("rapid-user")).toHaveTextContent("User: User 4");
    });
  });

  test("accepts empty object as a user value", async () => {
    const user = userEvent.setup();

    const EmptyObjectConsumer = () => {
      const { currentUser2, setCurrentUser2 } = useContext(CurrentUserContext);
      return (
        <div>
          <p data-testid="empty-user">{currentUser2 ? "User exists" : "No User"}</p>
          <button data-testid="set-empty" onClick={() => setCurrentUser2({})}>
            Set Empty
          </button>
        </div>
      );
    };

    render(
      <CurrentUserContextProvider>
        <EmptyObjectConsumer />
      </CurrentUserContextProvider>
    );

    await user.click(screen.getByTestId("set-empty"));

    await waitFor(() => {
      expect(screen.getByTestId("empty-user")).toHaveTextContent("User exists");
    });
  });
});
