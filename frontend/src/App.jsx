import React, { useState } from "react";
import axios from "axios";
import DemoPopup from "./components/Popup";

const examples = [
  { owner: "facebook", repo: "react" },
  { owner: "microsoft", repo: "vscode" },
  { owner: "vuejs", repo: "vue" },
  { owner: "torvalds", repo: "linux" },
  { owner: "angular", repo: "angular" },
];

export default function App() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [changelog, setChangelog] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDemo, setOpenDemo] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const r = await axios.post("http://localhost:4000/generate-changelog", {
        owner,
        repo,
      });
      setChangelog(r.data.changelog || "No changelog returned");
    } catch (e) {
      setChangelog("Error: " + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 800 }}>
      <h2>
        Proof of concept to showcase model-context-protocol with claude's skills
        feature
        <span
          onClick={() => setOpenDemo(true)}
          style={{
            marginLeft: "20px",
            fontSize: "14px",
            color: "goldenrod",
            cursor: "pointer",
          }}
        >
          How this POC works?
        </span>
      </h2>
      <div style={{ marginBottom: 8 }}>
        <label>
          Owner:{" "}
          <input
            placeholder="Username of git account"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: 12 }}>
          Repo:{" "}
          <input
            placeholder="Public repo name"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
        </label>
        <button onClick={submit} style={{ marginLeft: 12 }}>
          {loading ? "Working..." : "Generate"}
        </button>
      </div>
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: "#f0f0f0",
          borderRadius: 4,
        }}
      >
        <p style={{ marginTop: 0, marginBottom: 8, fontWeight: "bold" }}>
          Try these examples:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOwner(example.owner);
                setRepo(example.repo);
              }}
              style={{
                padding: "6px 12px",
                background: "#007acc",
                color: "white",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {example.owner}/{example.repo}
            </button>
          ))}
        </div>
      </div>
      <pre
        style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 12 }}
      >
        {changelog}
      </pre>

      <DemoPopup open={openDemo} onClose={() => setOpenDemo(false)} />
    </div>
  );
}
