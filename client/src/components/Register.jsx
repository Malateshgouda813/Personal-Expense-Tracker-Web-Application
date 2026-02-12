import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
export default function Register({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      onSuccess(data.token, data.user); // ✅ call App's setUser indirectly
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc" }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc" }}
      />
      <button
        onClick={handleRegister}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Register
      </button>
      {error && <p style={{ color: "#ef4444", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
