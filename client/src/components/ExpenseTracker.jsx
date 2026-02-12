
const API_URL = import.meta.env.VITE_API_URL;
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const quotes = [
  "The speed of your success is limited only by your dedication and what you’re willing to sacrifice.",
  "It’s pointless to set goals if you are not going to try to hit them.",
  "Financial fitness is not a pipe dream. It’s a reality if you are willing to pursue it.",
  "Rich people act in spite of fear. Poor people let fear stop them.",
  "You can’t always visualize the reward, but you can believe in the sacrifice.",
  "At least eighty percent of millionaires are self-made.",
  "Financial security and independence rest on savings, insurance, and investments.",
  "What separates winners from losers is how they react to each new twist of fate.",
  "The difference between succeeding and failing is consistency.",
  "Luck is preparation meeting opportunity.",
  "People who are enthusiastic make more money. Choose to be enthusiastic.",
  "Buy quality when it is marked down.",
  "More people should tell their money where to go instead of asking where it went.",
  "Only buy something you’d be happy to hold for ten years.",
  "Excuses earn sympathy. Discipline earns money.",
  "Focus on solving problems for the world. Money will follow."
];

export default function ExpenseTracker({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [colors, setColors] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [quote, setQuote] = useState("");

  // Expense limit states
  const [limit, setLimit] = useState("");
  const [limitType, setLimitType] = useState("monthly");
  const [limitExceeded, setLimitExceeded] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Load saved limit + type
  useEffect(() => {
    const savedLimit = localStorage.getItem("expense_limit");
    const savedLimitType = localStorage.getItem("expense_limit_type");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedLimit) setLimit(savedLimit);
    if (savedLimitType) setLimitType(savedLimitType);
  }, []);

  // Random quote on login
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(quotes[randomIndex]);
  }, []);

  // Generate random colors
  const generateColors = (count) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(
        "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")
      );
    }
    return arr;
  };

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${API_URL}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setExpenses(data);
        setColors(generateColors(data.length));
      } catch {
        setError("Server error");
      }
    };

    fetchExpenses();
  }, [token]);

  // Add expense
  const addExpense = async () => {
    if (!title || !amount) return;

    await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, amount }),
    });

    setTitle("");
    setAmount("");

       const res = await fetch(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setExpenses(data);
    setColors(generateColors(data.length));
  };

  // Delete expense

 
 
  const deleteExpense = async (id) => {
   await fetch(`${API_URL}/expenses/${id}`, { method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await fetch(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setExpenses(data);
    setColors(generateColors(data.length));
  };

  // Download expenses
  const downloadExpenses = () => {
    const headers = ["Title", "Amount"];
    const rows = expenses.map((e) => [e.title, e.amount]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "my_expenses.csv";
    link.click();
  };

  // Total expense
  const totalExpense = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Check limit
  useEffect(() => {
    if (!limit) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLimitExceeded(totalExpense > Number(limit));
  }, [totalExpense, limit]);

  // Pie data
  const data = {
    labels: expenses.length ? expenses.map((e) => e.title) : ["No Data"],
    datasets: [
      {
        data: expenses.length ? expenses.map((e) => Number(e.amount)) : [1],
        backgroundColor: expenses.length ? colors : ["#ccc"],
      },
    ],
  };

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <h2>Welcome, {user.username}</h2>
        <h3>Add your expenses</h3>
      </div>

      {quote && (
        <div style={{ marginTop: "8px" }}>
          <p style={{ fontWeight: "600" }}>Today’s Quote</p>
          <p style={{ fontStyle: "italic", color: "#555" }}>“{quote}”</p>
        </div>
      )}

      <div className="add-expense">
        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={addExpense}>Add</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Set Expense Limit</h4>

        <input
          type="number"
          placeholder="Enter limit"
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            localStorage.setItem("expense_limit", e.target.value);
          }}
        />

        <select
          value={limitType}
          onChange={(e) => {
            setLimitType(e.target.value);
            localStorage.setItem("expense_limit_type", e.target.value);
          }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <p>Total {limitType} expense: ₹{totalExpense}</p>

        {limitExceeded && (
          <p style={{ color: "#ef4444", fontWeight: "bold" }}>
            ⚠ Expense limit exceeded!
          </p>
        )}
      </div>
       

<div className="expenses-list">
  <p style={{ fontWeight: "600", marginBottom: "8px" }}>
    Expense History
  </p>

  {expenses.map((e) => (
    <div key={e.id} className="expense-item">
      <span>{e.title}: ₹{e.amount}</span>
      <button onClick={() => deleteExpense(e.id)}>Delete</button>
    </div>
  ))}
</div>


      <div className="chart-container">
        <Pie data={data} />
      </div>

      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <button onClick={downloadExpenses}>
          ⬇ Download Expenses
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
