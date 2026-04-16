import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";

const TestLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleResponse = async (response) => {
    try {
        //
      // console.log("Google response:", response); // Avoid logging credentials in production
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        dispatch(loginSuccess(data));
        navigate("/");
      } else {
        console.error("Login failed:", data.message);
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Error logging in");
    }
  };

  useEffect(() => {
    /* global google */
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        google.accounts.id.renderButton(
          document.getElementById("googleIcon"),
          { theme: "outline", size: "large" }
        );
        return true;
      }
      return false;
    };

    if (!initializeGoogle()) {
      const intervalId = setInterval(() => {
        if (initializeGoogle()) {
          clearInterval(intervalId);
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <div id="googleIcon"></div>
    </div>
  );
};

export default TestLogin;
