import { useLocation, useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const message = location.state?.message || "Something went wrong";

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ color: "red", marginBottom: "16px" }}>Error</h1>
      <p>{message}</p>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        Go to Home
      </button>
    </div>
  );
}
