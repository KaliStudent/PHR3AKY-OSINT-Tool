import { useState } from "react";

export default function Home() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?number=${number}`);

      if (!res.ok) {
        throw new Error("Lookup failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to fetch data");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>PHR3AKY OSINT</h1>

      <div style={styles.inputRow}>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter phone number"
          style={styles.input}
        />
        <button onClick={runScan} style={styles.button}>
          SCAN
        </button>
      </div>

      {loading && <p style={styles.status}>Scanning...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.resultBox}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#00ff9f",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "monospace",
  },
  title: {
    marginBottom: "20px",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    backgroundColor: "#111",
    border: "1px solid #00ff9f",
    color: "#00ff9f",
    flex: 1,
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#00ff9f",
    color: "#000",
    border: "none",
    cursor: "pointer",
  },
  status: {
    color: "#ccc",
  },
  error: {
    color: "red",
  },
  resultBox: {
    marginTop: "20px",
    backgroundColor: "#111",
    padding: "20px",
    border: "1px solid #00ff9f",
  },
};
