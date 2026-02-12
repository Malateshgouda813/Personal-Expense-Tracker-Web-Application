// 🔴 STEP 1: Load environment variables (VERY FIRST LINE)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();

// 🔹 Middleware
app.use(
  cors({
    origin: process.env.VITE_PORT, // allow any localhost port
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 🔹 JWT secret from .env
const SECRET = process.env.JWT_SECRET;

// 🔐 Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// ------------------- AUTH ROUTES -------------------

// Register
app.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id, username, email",
      [username, email, hashed]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "2h" });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (result.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "2h" });

    res.json({
      token,
      user: { id: user.id, username: user.username, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- EXPENSE ROUTES -------------------

// Get expenses
app.get("/expenses", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE user_id=$1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add expense
app.post("/expenses", authMiddleware, async (req, res) => {
  const { title, amount } = req.body;
  try {
    await pool.query(
      "INSERT INTO expenses (user_id, title, amount) VALUES ($1,$2,$3)",
      [req.user.id, title, amount]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete expense
app.delete("/expenses/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "DELETE FROM expenses WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});

// ------------------- START SERVER -------------------

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
