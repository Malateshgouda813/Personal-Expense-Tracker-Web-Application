import { useState, useEffect } from "react";
import ExpenseTracker from "./components/ExpenseTracker";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // "login" | "register"

  // ✅ Load user from localStorage safely
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.error("Invalid user data in localStorage");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView("login");
  };

  // ✅ Login/Register success
  const handleAuthSuccess = (token, userData) => {
    if (!token || !userData) return;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  // ✅ Logged-in view
  if (user) {
    return (
      <div>
        <button
          onClick={logout}
          style={{
            margin: "20px",
            padding: "10px 16px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

        <ExpenseTracker user={user} />
      </div>
    );
  }

  // ✅ Login / Register view
  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      {view === "login" ? (
        <>
          <Login onSuccess={handleAuthSuccess} />
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            New user?{" "}
            <button
              onClick={() => setView("register")}
              style={{
                border: "none",
                background: "none",
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Register here
            </button>
          </p>
        </>
      ) : (
        <>
          <Register onSuccess={handleAuthSuccess} />
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Already have an account?{" "}
            <button
              onClick={() => setView("login")}
              style={{
                border: "none",
                background: "none",
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Login here
            </button>
          </p>
        </>
      )}
    </div>
  );
}
